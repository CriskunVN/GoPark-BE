import mongoose from 'mongoose';

const parkingLotSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  parkingOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  localtion: {
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
  totalSlots: {
    type: Number,
    required: true,
    default: 0, // Số lượng chỗ đỗ ban đầu
  },
  availableSlots: {
    type: Number,
    required: true,
    default: 0, // Số lượng chỗ trống ban đầu
  },
  pricePerHour: {
    type: Number,
    required: true,
    default: 0, // Giá tiền mỗi giờ
  },
  createdAt: {
    type: Date,
    default: Date.now, // Ngày tạo
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
});

parkingLotSchema.index({ localtion: '2dsphere' }); // Tạo chỉ mục 2dsphere cho trường localtion để hỗ trợ truy vấn không gian
parkingLotSchema.index({ name: 'text' }); // Tạo chỉ mục văn bản cho trường name để hỗ trợ tìm kiếm

const ParkingLot = mongoose.model('ParkingLot', parkingLotSchema);

export default ParkingLot;
