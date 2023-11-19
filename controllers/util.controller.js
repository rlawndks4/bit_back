'use strict';
import db, { pool } from "../config/db.js";
import { checkDns, checkLevel, lowLevelException, response } from "../utils.js/util.js";
import 'dotenv/config';

const utilCtrl = {
    changeStatus: async (req, res, next) => {
        try {
            const decode_user = checkLevel(req.cookies.token, 10);
            const decode_dns = checkDns(req.cookies.dns);
            const { table, column_name } = req.params;
            const { value = 0, id } = req.body;
            if (!decode_user) {
                return lowLevelException(req, res);
            }
            let result = await pool.query(`UPDATE ${table} SET ${column_name}=? WHERE id=?`, [value, id]);
            return response(req, res, 100, "success", {});
        } catch (err) {
            console.log(err)
            return response(req, res, -200, "서버 에러 발생", false)
        } finally {

        }
    },
};

export default utilCtrl;
