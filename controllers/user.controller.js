'use strict';
import db, { pool } from "../config/db.js";
import { checkIsManagerUrl } from "../utils.js/function.js";
import { deleteQuery, getSelectQuery, insertQuery, selectQuerySimple, updateQuery } from "../utils.js/query-util.js";
import { checkDns, checkLevel, createHashedPassword, isItemBrandIdSameDnsId, lowLevelException, makeObjByList, makeUserTree, response, settingFiles } from "../utils.js/util.js";
import 'dotenv/config';

const table_name = 'users';

const userCtrl = {
    list: async (req, res, next) => {
        try {
            let is_manager = await checkIsManagerUrl(req);
            const decode_user = checkLevel(req.cookies.token, 0);
            const decode_dns = checkLevel(req.cookies.dns, 0);
            const { level } = req.query;

            let columns = [
                `${table_name}.*`,
                `(SELECT SUM(deposit) FROM deposits WHERE user_id=${table_name}.id) AS total_deposit`
            ]
            let sql = `SELECT ${process.env.SELECT_COLUMN_SECRET} FROM ${table_name} `;
            sql += ` WHERE brand_id=${decode_dns?.id} `;
            if (!level) {
                sql += ` AND ${table_name}.level=0 `;
            } else {
                sql += ` AND ${table_name}.level=${level} `;
            }
            let data = await getSelectQuery(sql, columns, req.query);

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
            let data = await pool.query(`SELECT * FROM ${table_name} WHERE id=${id}`)
            data = data?.result[0];
            let ip_list = await pool.query(`SELECT * FROM permit_ips WHERE user_id=${id} AND is_delete=0`);
            data = {
                ...data,
                ip_list: ip_list?.result
            }
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
                user_name, user_pw, nickname, level = 0, phone_num, profile_img, note, ip_list = [], brand_id
            } = req.body;
            if (level > decode_user?.level) {
                return lowLevelException(req, res);
            }
            let is_exist_user = await pool.query(`SELECT * FROM ${table_name} WHERE user_name=? `, [user_name]);
            if (is_exist_user?.result.length > 0) {
                return response(req, res, -100, "유저아이디가 이미 존재합니다.", false)
            }
            let pw_data = await createHashedPassword(user_pw);
            user_pw = pw_data.hashedPassword;
            let user_salt = pw_data.salt;
            let files = settingFiles(req.files);
            let obj = {
                user_name, user_pw, user_salt, nickname, level, phone_num, profile_img, note, brand_id
            };
            obj = { ...obj, ...files };
            await db.beginTransaction();
            let result = await insertQuery(`${table_name}`, obj);
            let user_id = result?.result?.insertId;
            let result_ip_list = [];
            for (var i = 0; i < ip_list.length; i++) {
                if (ip_list[i]?.is_delete != 1) {
                    result_ip_list.push([
                        user_id,
                        ip_list[i]?.ip
                    ])
                }

            }
            if (result_ip_list.length > 0) {
                let result2 = await pool.query(`INSERT INTO permit_ips (user_id, ip) VALUES ?`, [result_ip_list]);
            }
            await db.commit();
            return response(req, res, 100, "success", {})
        } catch (err) {
            await db.rollback();
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
                user_name, nickname, phone_num, profile_img, note, id, ip_list = []
            } = req.body;
            if (!(decode_user?.level >= 40)) {
                return lowLevelException(req, res);
            }
            let is_exist_user = await pool.query(`SELECT * FROM ${table_name} WHERE user_name=? AND id!=${id}`, [user_name]);
            if (is_exist_user?.result.length > 0) {
                return response(req, res, -100, "유저아이디가 이미 존재합니다.", false)
            }
            let files = settingFiles(req.files);
            let obj = {
                user_name, nickname, phone_num, profile_img, note
            };
            obj = { ...obj, ...files };
            await db.beginTransaction();
            let result = await updateQuery(`${table_name}`, obj, id);
            let result_insert_ip_list = [];
            let result_update_ip_list = [];
            let result_delete_ip_list = [];
            for (var i = 0; i < ip_list.length; i++) {
                if (!ip_list[i]?.id) {
                    if (ip_list[i]?.is_delete != 1) {
                        result_insert_ip_list.push([
                            id,
                            ip_list[i]?.ip,
                        ])
                    }
                } else {
                    if (ip_list[i]?.is_delete == 1) {
                        result_delete_ip_list.push(ip_list[i]?.id);
                    } else {
                        result_update_ip_list.push(ip_list[i]);
                    }
                }
            }
            if (result_insert_ip_list.length > 0) {//신규
                let insert_ip_result = await pool.query(`INSERT INTO permit_ips (user_id, ip) VALUES ?`, [result_insert_ip_list])
            }
            if (result_update_ip_list.length > 0) {//기존
                for (var i = 0; i < result_update_ip_list.length; i++) {
                    let update_ip_result = await updateQuery(`permit_ips`, {
                        ip: result_update_ip_list[i]?.ip
                    }, result_update_ip_list[i]?.id);
                }
            }
            if (result_delete_ip_list.length > 0) {//기존거 삭제
                let delete_ip_result = await pool.query(`DELETE FROM permit_ips WHERE id IN (${result_delete_ip_list.join()})`)
            }
            await db.commit();
            return response(req, res, 100, "success", {})
        } catch (err) {
            console.log(err)
            await db.rollback();
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
    changePassword: async (req, res, next) => {
        try {
            let is_manager = await checkIsManagerUrl(req);
            const decode_user = checkLevel(req.cookies.token, 0);

            const { id } = req.params
            let { user_pw } = req.body;

            let user = await selectQuerySimple(table_name, id);
            user = user?.result[0];
            if (!user || decode_user?.level < user?.level) {
                return response(req, res, -100, "잘못된 접근입니다.", false)
            }
            let pw_data = await createHashedPassword(user_pw);
            user_pw = pw_data.hashedPassword;
            let user_salt = pw_data.salt;
            let obj = {
                user_pw, user_salt
            }
            let result = await updateQuery(`${table_name}`, obj, id);
            return response(req, res, 100, "success", {})
        } catch (err) {
            console.log(err)
            return response(req, res, -200, "서버 에러 발생", false)
        } finally {

        }
    },
    changeStatus: async (req, res, next) => {
        try {
            let is_manager = await checkIsManagerUrl(req);
            const decode_user = checkLevel(req.cookies.token, 0);

            const { id } = req.params
            let { status } = req.body;
            let user = await selectQuerySimple(table_name, id);
            console.log(status)
            user = user?.result[0];
            if (!user || decode_user?.level < user?.level) {
                return response(req, res, -100, "잘못된 접근입니다.", false)
            }
            let obj = {
                status
            }
            let result = await updateQuery(`${table_name}`, obj, id);
            return response(req, res, 100, "success", {})
        } catch (err) {
            console.log(err)
            return response(req, res, -200, "서버 에러 발생", false)
        } finally {

        }
    },
    changeApiKey: async (req, res, next) => {//api_key재발급
        try {
            let is_manager = await checkIsManagerUrl(req);
            const decode_user = checkLevel(req.cookies.token, 0);
            const { id } = req.params;
            console.log(id)
            let key_data = await createHashedPassword(`${id}`);
            let api_key = key_data.hashedPassword.substring(0, 30);
            let obj = {
                api_key
            }
            let result = await updateQuery(`${table_name}`, obj, id);
            return response(req, res, 100, "success", {})
        } catch (err) {
            console.log(err)
            return response(req, res, -200, "서버 에러 발생", false)
        } finally {

        }
    },
}
export default userCtrl;
