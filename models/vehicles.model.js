import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema({
  licensePlate: {
    type: String,
    required: true,
    unique: true,
  },
  capacity: {
    type: Number,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User", // Optional: nếu bạn có model User và muốn populate
  },
}, {
  timestamps: true, // Optional: tự động thêm createdAt & updatedAt
});

const Vehicle = mongoose.model("Vehicle", vehicleSchema);
export default Vehicle;
