import express from 'express';
import userRoutes from './user.route.js';
import authRoutes from './auth.route.js';
import uploadRoutes from './upload.route.js';
import postRoutes from './post.route.js';
import domainRoutes from './domain.route.js';
import brandRoutes from './brand.route.js';

const router = express.Router(); // eslint-disable-line new-cap

/** GET /health-check - Check service health */

// tables
router.use('/users', userRoutes);
router.use('/posts', postRoutes);
router.use('/brands', brandRoutes);


//auth
router.use('/auth', authRoutes);

//util
router.use('/domain', domainRoutes);
router.use('/upload', uploadRoutes);



export default router;
