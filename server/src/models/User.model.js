
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  questions:{type:[{ type:mongoose.Schema.Types.ObjectId,ref:"Question"}]}
<<<<<<< HEAD
},
{timestamps: true});
=======
},{timestamps:true});
>>>>>>> 55e5e3fad73bd4d7c6472c68766a07cac8d824e4

export default mongoose.model('User', UserSchema);
