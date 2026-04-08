import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    job:       { type: mongoose.Schema.Types.ObjectId, ref: 'Job',  required: true },
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'shortlisted', 'rejected'],
      default: 'pending',
    },
    coverLetter: { type: String, default: '' },
    resumeUrl:   { type: String, default: null },
  },
  { timestamps: true }
);

// One application per job per user
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
applicationSchema.index({ applicant: 1, createdAt: -1 });
applicationSchema.index({ job: 1, status: 1 });

export default mongoose.model('Application', applicationSchema);
