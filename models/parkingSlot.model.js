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
    //   vehicleType: {
    //     type: String,
    //     enum: ['Xe máy', 'Ô tô', 'Xe đạp'],
    //     required: true,
    //   },

    // thời gian hết hạn của slot cũng như của booking
    zone: {
      type: String,
      required: true,
    },
     pricePerHour: {
      type: Number,
      required: true,
      default: 0, // Giá tiền mỗi giờ
    },

  },
  { timestamps: true } // sinh thêm trường updatedAt và createdAt
);

const ParkingSlot = mongoose.model('ParkingSlot', parkingSlotSchema);

export default ParkingSlot;
