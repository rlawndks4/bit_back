import express from 'express';
import validate from 'express-validation';
import { templeteCtrl } from '../controllers/index.js';

const router = express.Router(); // eslint-disable-line new-cap

router
    .route('/')
    .get(templeteCtrl.list)
    .post(templeteCtrl.create)
router
    .route('/:id')
    .get(templeteCtrl.get)
    .put(templeteCtrl.update)
    .delete(templeteCtrl.remove)


export default router;
