import { Router } from 'express';
import { getJobs, getJobById, getMyJobs, createJob, updateJob, deleteJob } from '../controllers/job.controller.js';
import { protect, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/',    getJobs);
router.get('/my',  protect, requireRole('recruiter'), getMyJobs);
router.get('/:id', getJobById);

router.post('/',    protect, requireRole('recruiter'), createJob);
router.put('/:id',  protect, requireRole('recruiter'), updateJob);
router.delete('/:id', protect, requireRole('recruiter'), deleteJob);

export default router;
