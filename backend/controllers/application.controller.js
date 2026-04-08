import Application from '../models/application.model.js';
import Job from '../models/job.model.js';

// POST /api/applications/apply  — seeker
export const applyToJob = async (req, res, next) => {
  try {
    const { jobId, coverLetter } = req.body;
    if (!jobId)
      return res.status(400).json({ success: false, message: 'jobId is required' });

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    if (job.status !== 'open')
      return res.status(400).json({ success: false, message: 'This job is no longer accepting applications' });

    if (await Application.findOne({ job: jobId, applicant: req.user._id }))
      return res.status(409).json({ success: false, message: 'Already applied to this job' });

    const application = await Application.create({
      job: jobId,
      applicant: req.user._id,
      coverLetter: coverLetter || '',
      resumeUrl: req.file ? `/uploads/resumes/${req.file.filename}` : (req.user.resumeUrl || null),
    });

    await Job.findByIdAndUpdate(jobId, { $inc: { applicantCount: 1 } });
    return res.status(201).json({ success: true, data: application });
  } catch (err) { next(err); }
};

// GET /api/applications/my  — seeker
export const getMyApplications = async (req, res, next) => {
  try {
    const apps = await Application.find({ applicant: req.user._id })
      .populate('job', 'title company location type status salary')
      .sort({ createdAt: -1 });
    return res.json({ success: true, data: apps });
  } catch (err) { next(err); }
};

// GET /api/applications/job/:jobId  — recruiter, own job
export const getJobApplications = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    if (job.postedBy.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorised' });

    const { status, page = 1, limit = 20 } = req.query;
    const filter = { job: job._id };
    if (status) filter.status = status;
    const skip = (Number(page) - 1) * Number(limit);

    const [apps, total] = await Promise.all([
      Application.find(filter)
        .populate('applicant', 'fullName email skills resumeUrl bio')
        .sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Application.countDocuments(filter),
    ]);
    return res.json({ success: true, data: apps, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
  } catch (err) { next(err); }
};

// PATCH /api/applications/:id/status  — recruiter
export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['pending','reviewed','shortlisted','rejected'];
    if (!allowed.includes(status))
      return res.status(400).json({ success: false, message: `status must be one of: ${allowed.join(', ')}` });

    const app = await Application.findById(req.params.id).populate('job', 'postedBy');
    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });
    if (app.job.postedBy.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorised' });

    app.status = status;
    await app.save();
    return res.json({ success: true, data: app });
  } catch (err) { next(err); }
};
