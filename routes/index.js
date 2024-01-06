import express from 'express';
import userRoutes from './user.route.js';
import authRoutes from './auth.route.js';
import uploadRoutes from './upload.route.js';
import postRoutes from './post.route.js';
import domainRoutes from './domain.route.js';
import brandRoutes from './brand.route.js';
import utilRoutes from './util.route.js';
import requestRoutes from './request.route.js'

const router = express.Router(); // eslint-disable-line new-cap

/** GET /health-check - Check service health */

// tables
router.use('/users', userRoutes);
router.use('/posts', postRoutes);
router.use('/brands', brandRoutes);
router.use('/requests', requestRoutes);

//auth
router.use('/auth', authRoutes);

//util
router.use('/domain', domainRoutes);
router.use('/upload', uploadRoutes);
router.use('/util', utilRoutes);



export default router;
