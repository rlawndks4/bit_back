import express from 'express';
import userRoutes from './user.route.js';
import authRoutes from './auth.route.js';
import uploadRoutes from './upload.route.js';
import postRoutes from './post.route.js';
import domainRoutes from './domain.route.js';
import brandRoutes from './brand.route.js';
import senderRoutes from './sender.route.js';
import depositRoutes from './deposit.route.js';
import kakaoChannelRoutes from './kakao_channel.route.js';
import templateRoutes from './templete.route.js';
import utilRoutes from './util.route.js';

const router = express.Router(); // eslint-disable-line new-cap

/** GET /health-check - Check service health */

// tables
router.use('/users', userRoutes);
router.use('/posts', postRoutes);
router.use('/brands', brandRoutes);
router.use('/senders', senderRoutes);
router.use('/deposits', depositRoutes);
router.use('/kakao-channels', kakaoChannelRoutes);
router.use('/templetes', templateRoutes);

//auth
router.use('/auth', authRoutes);

//util
router.use('/domain', domainRoutes);
router.use('/upload', uploadRoutes);
router.use('/util', utilRoutes);



export default router;
