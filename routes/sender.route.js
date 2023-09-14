import express from 'express';
import validate from 'express-validation';
import { senderCtrl } from '../controllers/index.js';

const router = express.Router(); // eslint-disable-line new-cap

router
    .route('/')
    .get(senderCtrl.list)
    .post(senderCtrl.create)
router
    .route('/:id')
    .get(senderCtrl.get)
    .put(senderCtrl.update)
    .delete(senderCtrl.remove)


export default router;
