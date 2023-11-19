'use strict';
import { pool } from "../config/db.js";
import { checkIsManagerUrl } from "../utils.js/function.js";
import { deleteQuery, getSelectQuery, insertQuery, selectQuerySimple, updateQuery } from "../utils.js/query-util.js";
import { checkDns, checkLevel, response, settingFiles } from "../utils.js/util.js";
import 'dotenv/config';

const table_name = 'templetes';

const templeteCtrl = {
    list: async (req, res, next) => {
        try {
            let is_manager = await checkIsManagerUrl(req);
            const decode_user = checkLevel(req.cookies.token, 0);

            const { channel_id } = req.query;
            let columns = [
                `${table_name}.*`,
                `kakao_channels.channel_user_name`,
                `kakao_channels.phone_num AS sender`,
                `kakao_channels.senderkey`,
                `users.user_name`,
                `users.api_key`,
                `users.kakao_token`,

            ]
            let sql = `SELECT ${process.env.SELECT_COLUMN_SECRET} FROM ${table_name} `;
            sql += ` LEFT JOIN kakao_channels ON ${table_name}.channel_id=kakao_channels.id `;
            sql += ` LEFT JOIN users ON ${table_name}.user_id=users.id `;
            sql += ` WHERE 1=1 `;
            if (channel_id) {
                sql += ` AND ${table_name}.channel_id=${channel_id} `
            }
            let data = await getSelectQuery(sql, columns, req.query);
            for (var i = 0; i < data.content.length; i++) {
                data.content[i].button_obj = JSON.parse(data?.content[i]?.button_obj ?? '[]');
            }
            return response(req, res, 100, "success", data);
        } catch (err) {
            console.log(err)
            return response(req, res, -200, "서버 에러 발생", false)
        } finally {

        }
    },
    get: async (req, res, next) => {
        try {
            let is_manager = await checkIsManagerUrl(req);
            const decode_user = checkLevel(req.cookies.token, 0);

            const { id } = req.params;
            let columns = [
                `${table_name}.*`,
                `users.user_name`,
                `kakao_channels.channel_user_name`,
            ]
            let sql = `SELECT ${columns.join()} FROM ${table_name} `;
            sql += ` LEFT JOIN users ON ${table_name}.user_id=users.id `;
            sql += ` LEFT JOIN kakao_channels ON ${table_name}.channel_id=kakao_channels.id `;
            sql += ` WHERE ${table_name}.id=${id} `
            let data = await pool.query(sql);
            data = data?.result[0];
            data['button_obj'] = JSON.parse(data?.button_obj ?? '[]')
            return response(req, res, 100, "success", data)
        } catch (err) {
            console.log(err)
            return response(req, res, -200, "서버 에러 발생", false)
        } finally {

        }
    },
    create: async (req, res, next) => {
        try {
            let is_manager = await checkIsManagerUrl(req);
            const decode_user = checkLevel(req.cookies.token, 0);

            let {
                msg_type,
                tpl_code, emphasis_type, img_type, templete_img_text, nickname, title = "", sub_title = "", msg = "",
                button_obj = [],
                channel_user_name, user_name,
            } = req.body;
            let kakao_channel = await pool.query(`SELECT kakao_channels.* FROM kakao_channels LEFT JOIN users ON kakao_channels.user_id=users.id WHERE kakao_channels.channel_user_name=? AND users.user_name=?`, [channel_user_name, user_name])
            kakao_channel = kakao_channel?.result[0];
            if (!kakao_channel) {
                return response(req, res, -100, "유저 및 채널정보가 정확하지 않습니다.", false);
            }
            let channel_id = kakao_channel?.id
            let user_id = kakao_channel?.user_id
            button_obj = JSON.stringify(button_obj);
            let files = settingFiles(req.files);
            let obj = {
                channel_id,
                user_id,
                tpl_code,
                nickname,
                msg_type,
                emphasis_type,
                img_type,
                templete_img_text,
                title,
                sub_title,
                msg,
                button_obj
            };
            console.log(button_obj)
            obj = { ...obj, ...files };

            let result = await insertQuery(`${table_name}`, obj);

            return response(req, res, 100, "success", {})
        } catch (err) {
            console.log(err)
            return response(req, res, -200, "서버 에러 발생", false)
        } finally {

        }
    },
    update: async (req, res, next) => {
        try {
            let is_manager = await checkIsManagerUrl(req);
            const decode_user = checkLevel(req.cookies.token, 0);
            let {
                msg_type,
                tpl_code, emphasis_type, img_type, templete_img_text, nickname, title = "", sub_title = "", msg = "",
                button_obj = [],
                channel_user_name, user_name,
                id
            } = req.body;
            let kakao_channel = await pool.query(`SELECT kakao_channels.* FROM kakao_channels LEFT JOIN users ON kakao_channels.user_id=users.id WHERE kakao_channels.channel_user_name=? AND users.user_name=?`, [channel_user_name, user_name])
            kakao_channel = kakao_channel?.result[0];
            if (!kakao_channel) {
                return response(req, res, -100, "유저 및 채널정보가 정확하지 않습니다.", false);
            }
            let channel_id = kakao_channel?.id
            let user_id = kakao_channel?.user_id
            button_obj = JSON.stringify(button_obj);
            let files = settingFiles(req.files);
            let obj = {
                channel_id,
                user_id,
                tpl_code,
                nickname,
                msg_type,
                emphasis_type,
                img_type,
                templete_img_text,
                title,
                sub_title,
                msg,
                button_obj
            };
            console.log(button_obj)
            obj = { ...obj, ...files };


            let result = await updateQuery(`${table_name}`, obj, id);

            return response(req, res, 100, "success", {})
        } catch (err) {
            console.log(err)
            return response(req, res, -200, "서버 에러 발생", false)
        } finally {

        }
    },
    remove: async (req, res, next) => {
        try {
            let is_manager = await checkIsManagerUrl(req);
            const decode_user = checkLevel(req.cookies.token, 0);

            const { id } = req.params;
            let result = await deleteQuery(`${table_name}`, {
                id
            })
            return response(req, res, 100, "success", {})
        } catch (err) {
            console.log(err)
            return response(req, res, -200, "서버 에러 발생", false)
        } finally {

        }
    },
};

export default templeteCtrl;
