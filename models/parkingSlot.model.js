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
      enum: ['Trống', 'Đã đặt', 'Đặt trước'],
      default: 'Trống',
    },
    //   vehicleType: {
    //     type: String,
    //     enum: ['Xe máy', 'Ô tô', 'Xe đạp'],
    //     required: true,
    //   },

    // thời gian hết hạn của slot cũng như của booking
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true } // sinh thêm trường updatedAt và createdAt
);

const ParkingSlot = mongoose.model('ParkingSlot', parkingSlotSchema);

export default ParkingSlot;
