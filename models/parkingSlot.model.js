import mongoose from 'mongoose';

const parkingSlotSchema = new mongoose.Schema(
  {
    parkingLot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ParkingLot',
      require: true,
    },
    slotNumber: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['available', 'booked', 'reserved'],
      default: 'available',
    },
    zone: {
      type: String,
      required: true,
    },
     pricePerHour: {
      type: Number,
      required: true,
      default: 20000, // Giá tiền mỗi giờ, mặc định là 20.000 VNĐ
    },

  },
  { timestamps: true } // sinh thêm trường updatedAt và createdAt
);

const ParkingSlot = mongoose.model('ParkingSlot', parkingSlotSchema);

export default ParkingSlot;
