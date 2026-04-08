import Job from '../models/job.model.js';

// GET /api/jobs
export const getJobs = async (req, res, next) => {
  try {
    const { q, type, experience, location, status = 'open', page = 1, limit = 12 } = req.query;
    const filter = { status };
    if (q)          filter.$text = { $search: q };
    if (type)        filter.type = type;
    if (experience)  filter.experience = experience;
    if (location)    filter.location = { $regex: location, $options: 'i' };

    const skip = (Number(page) - 1) * Number(limit);
    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .populate('postedBy', 'fullName company')
        .sort(q ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
        .skip(skip).limit(Number(limit)),
      Job.countDocuments(filter),
    ]);
    return res.json({ success: true, data: jobs, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
  } catch (err) { next(err); }
};

// GET /api/jobs/:id
export const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'fullName company companyWebsite email');
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    return res.json({ success: true, data: job });
  } catch (err) { next(err); }
};

// GET /api/jobs/my  — recruiter
export const getMyJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id }).sort({ createdAt: -1 });
    return res.json({ success: true, data: jobs });
  } catch (err) { next(err); }
};

// POST /api/jobs  — recruiter
export const createJob = async (req, res, next) => {
  try {
    const { title, description, location, type, experience, salary, skills, status } = req.body;
    if (!title || !description || !location)
      return res.status(400).json({ success: false, message: 'title, description and location are required' });

    const job = await Job.create({
      title, description, location, type, experience, status,
      company: req.user.company || req.body.company || '',
      skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map(s => s.trim()).filter(Boolean) : []),
      salary: salary ? { min: Number(salary.min) || null, max: Number(salary.max) || null, currency: salary.currency || 'USD' } : undefined,
      postedBy: req.user._id,
    });
    return res.status(201).json({ success: true, data: job });
  } catch (err) { next(err); }
};

// PUT /api/jobs/:id  — recruiter, own job
export const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    if (job.postedBy.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorised' });

    const allowed = ['title','description','location','type','experience','salary','skills','status'];
    allowed.forEach(f => { if (req.body[f] !== undefined) job[f] = req.body[f]; });
    await job.save();
    return res.json({ success: true, data: job });
  } catch (err) { next(err); }
};

// DELETE /api/jobs/:id  — recruiter, own job
export const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    if (job.postedBy.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorised' });
    await job.deleteOne();
    return res.json({ success: true, message: 'Job deleted' });
  } catch (err) { next(err); }
};
