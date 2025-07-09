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
    address: {
      type: String,
      required: true, // Địa chỉ chi tiết, có thể chứa tên thành phố
    },
    zones: [
      {
        zone: { type: String, required: true }, // A, B, C
        count: { type: Number, required: true }, // số slot
      },
    ],
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
    allowedPaymentMethods: {
      type: [String],
      enum: ['prepaid', 'pay-at-parking' ], // Các phương thức thanh toán được hỗ trợ
      default: ['prepaid'],
    },
  },
  { timestamps: true } // sinh thêm trường updatedAt và createdAt
);

parkingLotSchema.index({ localtion: '2dsphere' }); // Tạo chỉ mục 2dsphere cho trường localtion để hỗ trợ truy vấn không gian
parkingLotSchema.index({ name: 'text' }); // Tạo chỉ mục văn bản cho trường name để hỗ trợ tìm kiếm

const ParkingLot = mongoose.model('ParkingLot', parkingLotSchema);

export default ParkingLot;
