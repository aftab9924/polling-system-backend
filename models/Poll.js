import mongoose from 'mongoose';

const PollSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    required: true,
  },
  expectedStudents: {
    type: Number,
    required: true,
  },
  results: {
    type: Map,
    of: String,
    default: {},
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
});

const Poll = mongoose.model('Poll', PollSchema);

export default Poll;
