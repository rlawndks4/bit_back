'use strict';
import { pool } from "../config/db.js";
import { checkIsManagerUrl } from "../utils.js/function.js";
import { checkLevel, makeUserToken, response } from "../utils.js/util.js";
import 'dotenv/config';

const domainCtrl = {
    get: async (req, res, next) => {
        try {
            let { dns } = req.query;
            if (dns == '127.0.0.1') {
                dns = 'sety21.cafe24.com';
            }
            let columns = [
                `id`,
                `name`,
                `dns`,
                `logo_img`,
                `dark_logo_img`,
                `favicon_img`,
                `og_img`,
                `og_description`,
                `company_name`,
                `business_num`,
                `pvcy_rep_name`,
                `ceo_name`,
                `addr`,
                `addr_detail`,
                `resident_num`,
                `phone_num`,
                `fax_num`,
                `theme_css`,
                `setting_obj`,
                `main_banner_img`,
                `main_banner_text`,
                `info_banner_img`,
                `program_info_banner_img`,
                `guide_banner_img`,
                `post_2_banner_img`,
                `post_3_banner_img`,
                `youtube_link`,
                `blog_link`,
                `kakao_link`,
                `phone_link`,
            ]
            let brand = await pool.query(`SELECT ${columns.join()} FROM brands WHERE dns='${dns}'`);
            brand = brand?.result[0];
            brand['theme_css'] = JSON.parse(brand?.theme_css ?? '{}');
            brand['setting_obj'] = JSON.parse(brand?.setting_obj ?? '{}');
            const token = await makeUserToken(brand);
            res.cookie("dns", token, {
                httpOnly: true,
                maxAge: (60 * 60 * 1000) * 3,
                //sameSite: 'none', 
                //secure: true 
            });
            return response(req, res, 100, "success", brand);
        } catch (err) {
            console.log(err)
            return response(req, res, -200, "서버 에러 발생", false)
        } finally {

        }
    },
}

export default domainCtrl;