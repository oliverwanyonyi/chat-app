import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    text: { type: String, required: true },
    users:{
      type:Array
    },
    sender:{type:mongoose.Schema.Types.ObjectId}
  },{
    timestamps:true
  })


export default mongoose.model("Message", messageSchema)