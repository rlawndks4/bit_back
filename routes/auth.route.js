import express from 'express';
import validate from 'express-validation';
import { authCtrl } from '../controllers/index.js';

const router = express.Router(); // eslint-disable-line new-cap

router
    .route('/')
    .get(authCtrl.checkSign);
router
    .route('/deposit')
    .get(authCtrl.getDeposit);
router
    .route('/sign-in')
    .post(authCtrl.signIn);
router
    .route('/sign-up')
    .post(authCtrl.signUp);
router
    .route('/sign-out')
    .post(authCtrl.signOut);
router
    .route('/update')
    .post(authCtrl.updateMyInfo);
router
    .route('/change-pw')
    .post(authCtrl.changePassword);
export default router;
