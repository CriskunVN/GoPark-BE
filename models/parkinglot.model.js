import mongoose from 'mongoose';

const parkingLotSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    parkingOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'], // Chỉ cho phép 'Point'
        default: 'Point', // Giá trị mặc định là 'Point'
      },
      coordinates: {
        type: [Number], // Mảng chứa kinh độ và vĩ độ vd:[105.854444, 21.028511]
        required: true,
      },
    },
    description: {
      type: String,
    },
    zones: [
      {
        zone: { type: String, required: true }, // A, B, C
        count: { type: Number, required: true }, // số slot
      },
    ],
    pricePerHour: {
      type: Number,
      required: true,
      default: 0, // Giá tiền mỗi giờ
    },

    isActive: {
      type: Boolean,
      default: true, // Trạng thái hoạt động của bãi đỗ
    },
    // Avatar
    avtImage: {
      type: String,
      default: '',
    },
    // Hình thông tin bãi
    image: {
      type: [String],
      default: '',
    },
  },
  { timestamps: true } // sinh thêm trường updatedAt và createdAt
);

parkingLotSchema.index({ localtion: '2dsphere' }); // Tạo chỉ mục 2dsphere cho trường localtion để hỗ trợ truy vấn không gian
parkingLotSchema.index({ name: 'text' }); // Tạo chỉ mục văn bản cho trường name để hỗ trợ tìm kiếm

const ParkingLot = mongoose.model('ParkingLot', parkingLotSchema);

export default ParkingLot;
