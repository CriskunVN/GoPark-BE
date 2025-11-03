import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    parkingSlotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ParkingSlot',
    },
    // Trạng thái booking
    status: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'cancelled',
        'completed',
        'checked-in',
        'over-due',
      ],
      default: 'pending',
    },
    // Thời gian bắt đầu và kết thúc của booking
    startTime: {
      type: Date,
      default: Date.now(), // Mặc định là thời gian hiện tại nếu không được cung cấp
      required: true, // Ngày bắt đầu là bắt buộc
    },
    endTime: {
      type: Date,
      required: true, // Ngày kết thúc là bắt buộc
    },
    // Thông tin xe
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
    },
    // thông tin snapshot của xe tại thời điểm booking
    vehicleSnapshot: {
      number: { type: String, trim: true, uppercase: true },
      image: { type: String, default: null },
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'unpaid'],
      default: 'unpaid',
    },
    paymentMethod: {
      type: String,
      enum: ['pay-at-parking', 'prepaid'],
      default: 'pay-at-parking', // Phương thức thanh toán mặc định
    },
    bookingDate: {
      type: Date,
      default: Date.now, // Ngày tạo booking, mặc định là ngày hiện tại
    },
    bookingType: {
      type: String,
      enum: ['date', 'hours', 'month'], // Loại booking, có thể là theo ngày hoặc theo giờ
      default: 'hours', // Mặc định là booking theo giờ
    },
    discount: {
      type: Number,
      default: 0, // phần trăm giảm giá hoặc số tiền giảm
    },
    totalPrice: {
      type: Number,
      required: true, // Tổng giá là bắt buộc
      default: 0, // Mặc định là 0 nếu không có giá trị
    },
    overDueInfo: {
      overDueStart: Date,
      overDueEnd: Date,
      overDueMinutes: Number,
      overDueFee: Number,
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
