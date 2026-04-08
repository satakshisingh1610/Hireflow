import { Router } from 'express';
import { applyToJob, getMyApplications, getJobApplications, updateApplicationStatus } from '../controllers/application.controller.js';
import { protect, requireRole } from '../middleware/auth.middleware.js';
import { uploadResume } from '../config/multer.js';

const router = Router();

router.post('/apply',           protect, requireRole('seeker'),    uploadResume, applyToJob);
router.get('/my',               protect, requireRole('seeker'),    getMyApplications);
router.get('/job/:jobId',       protect, requireRole('recruiter'), getJobApplications);
router.patch('/:id/status',     protect, requireRole('recruiter'), updateApplicationStatus);

export default router;
