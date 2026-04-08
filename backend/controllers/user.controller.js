import User from '../models/user.model.js';

// GET /api/users/profile
export const getProfile = (req, res) =>
  res.json({ success: true, user: req.user });

// PUT /api/users/profile
export const updateProfile = async (req, res, next) => {
  try {
    const allowed = ['fullName','bio','skills','company','companyWebsite'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    return res.json({ success: true, user: user.toProfile() });
  } catch (err) { next(err); }
};

// POST /api/users/upload-resume  — seeker
export const uploadResume = async (req, res, next) => {
  try {
    if (!req.file)
      return res.status(400).json({ success: false, message: 'No file provided' });
    const resumeUrl = `/uploads/resumes/${req.file.filename}`;
    await User.findByIdAndUpdate(req.user._id, { resumeUrl });
    return res.json({ success: true, resumeUrl, message: 'Resume uploaded successfully' });
  } catch (err) { next(err); }
};

// POST /api/users/save-job/:jobId  — seeker (toggle)
export const toggleSavedJob = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const jobId = req.params.jobId;
    const isSaved = user.savedJobs.map(id => id.toString()).includes(jobId);
    if (isSaved) {
      user.savedJobs = user.savedJobs.filter(id => id.toString() !== jobId);
    } else {
      user.savedJobs.push(jobId);
    }
    await user.save();
    return res.json({ success: true, saved: !isSaved, savedJobs: user.savedJobs });
  } catch (err) { next(err); }
};

// GET /api/users/saved-jobs  — seeker
export const getSavedJobs = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'savedJobs',
      populate: { path: 'postedBy', select: 'fullName company' },
    });
    return res.json({ success: true, data: user.savedJobs });
  } catch (err) { next(err); }
};
