import express from 'express';
import validate from 'express-validation';
import { requestCtrl } from '../controllers/index.js';

const router = express.Router(); // eslint-disable-line new-cap

router
    .route('/')
    .get(requestCtrl.list)
    .post(requestCtrl.create)
router
    .route('/:id')
    .delete(requestCtrl.remove)


export default router;
