import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
    },
    text: { type: String, required: true },
    sender: { type: mongoose.Schema.Types.ObjectId },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Message", messageSchema);
