import express from 'express';
import validate from 'express-validation';
import { kakaoChannelCtrl } from '../controllers/index.js';

const router = express.Router(); // eslint-disable-line new-cap

router
    .route('/')
    .get(kakaoChannelCtrl.list)
    .post(kakaoChannelCtrl.create)
router
    .route('/:id')
    .get(kakaoChannelCtrl.get)
    .put(kakaoChannelCtrl.update)
    .delete(kakaoChannelCtrl.remove)


export default router;
