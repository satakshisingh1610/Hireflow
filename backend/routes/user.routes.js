import { Router } from 'express';
import { getProfile, updateProfile, uploadResume, toggleSavedJob, getSavedJobs } from '../controllers/user.controller.js';
import { protect, requireRole } from '../middleware/auth.middleware.js';
import { uploadResume as multerUpload } from '../config/multer.js';

const router = Router();

router.get('/profile',          protect, getProfile);
router.put('/profile',          protect, updateProfile);
router.post('/upload-resume',   protect, requireRole('seeker'), multerUpload, uploadResume);
router.post('/save-job/:jobId', protect, requireRole('seeker'), toggleSavedJob);
router.get('/saved-jobs',       protect, requireRole('seeker'), getSavedJobs);

export default router;
