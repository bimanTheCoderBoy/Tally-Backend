
import mongoose from 'mongoose';

const ContestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  creator: {
    type: String,
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  participants: [{
    userId: {
      type: String,
      required: true
    },
    userName: {
      type: String,
      required: true
    }
  }]
});

export default mongoose.model('Contest', ContestSchema);
