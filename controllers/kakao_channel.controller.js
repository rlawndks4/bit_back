'use strict';
import { pool } from "../config/db.js";
import { checkIsManagerUrl } from "../utils.js/function.js";
import { deleteQuery, getSelectQuery, insertQuery, selectQuerySimple, updateQuery } from "../utils.js/query-util.js";
import { settingGetDataByTable } from "../utils.js/table-util.js";
import { checkDns, checkLevel, response, settingFiles } from "../utils.js/util.js";
import 'dotenv/config';

const table_name = 'kakao_channels';

const kakaoChannelCtrl = {
    list: async (req, res, next) => {
        try {
            let is_manager = await checkIsManagerUrl(req);
            const decode_user = checkLevel(req.cookies.token, 0);
            const decode_dns = checkLevel(req.cookies.dns, 0);

            const { } = req.query;

            let columns = [
                `${table_name}.*`,
                `users.user_name`,
                `users.api_key`,
                `(SELECT COUNT(*) FROM templetes WHERE templetes.channel_id=${table_name}.id) AS templete_count`,
            ]
            let sql = `SELECT ${process.env.SELECT_COLUMN_SECRET} FROM ${table_name} `;
            sql += ` LEFT JOIN users ON ${table_name}.user_id=users.id `;
            sql += ` WHERE users.brand_id=${decode_dns?.id} `;
            let data = await getSelectQuery(sql, columns, req.query);
            data = settingGetDataByTable(data, table_name);
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
                `users.api_key`,
            ]
            let sql = `SELECT ${columns.join()} FROM ${table_name} `;
            sql += ` LEFT JOIN users ON ${table_name}.user_id=users.id `;
            sql += ` WHERE ${table_name}.id=${id} `
            let data = await pool.query(sql);
            data = data?.result[0];
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

            const {
                channel_user_name, phone_num, user_name, note, status = 0, senderkey
            } = req.body;
            let files = settingFiles(req.files, 'file');
            let obj = {
                channel_user_name, phone_num, note, status, senderkey
            };
            let is_exist_user = await pool.query(`SELECT * FROM users WHERE user_name=? `, [user_name]);
            if (is_exist_user?.result.length == 0) {
                return response(req, res, -100, "존재하지 않는 유저입니다.", false)
            }
            let user = is_exist_user?.result[0];
            obj['user_id'] = user?.id;
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

            const {
                channel_user_name, phone_num, user_name, note, status = 0, senderkey,
                id
            } = req.body;
            let files = settingFiles(req.files, 'file');
            let is_exist_user = await pool.query(`SELECT * FROM users WHERE user_name=? `, [user_name]);
            if (is_exist_user?.result.length == 0) {
                return response(req, res, -100, "존재하지 않는 유저입니다.", false)
            }
            let obj = {
                channel_user_name, phone_num, note, status, senderkey
            };
            let user = is_exist_user?.result[0];
            obj['user_id'] = user?.id;
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

export default kakaoChannelCtrl;
