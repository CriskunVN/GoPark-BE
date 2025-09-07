import mongoose from "mongoose";
const chatHistorySchema = new mongoose.Schema({
    userId: { type: String, default: null },
    message: String,
    aiReply: String,
    createdAt: { type: Date, default: Date.now }
});
export default mongoose.model("ChatHistory", chatHistorySchema);
//# sourceMappingURL=chatHistory.model.js.map