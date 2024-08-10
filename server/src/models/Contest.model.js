
import mongoose from 'mongoose';
function generateRandomString(length = 5) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
}
const ContestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
 
  contestCode:{
    type:String,
    default:generateRandomString()
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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
});

export default mongoose.model('Contest', ContestSchema);
