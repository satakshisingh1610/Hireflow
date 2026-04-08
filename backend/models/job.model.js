import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    title:       { type: String, required: [true, 'Job title is required'], trim: true },
    description: { type: String, required: [true, 'Description is required'] },
    company:     { type: String, required: [true, 'Company is required'], trim: true },
    location:    { type: String, required: [true, 'Location is required'], trim: true },
    type: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship', 'remote'],
      default: 'full-time',
    },
    experience: {
      type: String,
      enum: ['entry', 'mid', 'senior', 'lead'],
      default: 'entry',
    },
    salary: {
      min:      { type: Number, default: null },
      max:      { type: Number, default: null },
      currency: { type: String, default: 'USD' },
    },
    skills:  [{ type: String, trim: true }],
    status: {
      type: String,
      enum: ['open', 'closed', 'draft'],
      default: 'open',
    },
    postedBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    applicantCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

jobSchema.index({ title: 'text', description: 'text', company: 'text', skills: 'text' });
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ postedBy: 1 });

export default mongoose.model('Job', jobSchema);
