import mongoose from 'mongoose';
import QRCode from 'qrcode'; // Thư viện để tạo QR code
const ticketSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    slotNumber: {
      type: String,
      required: true,
    },
    vehicleNumber: {
      type: String,
      required: true, // Số xe là bắt buộc
      trim: true, // Loại bỏ khoảng trắng thừa
    },
    ticketType: {
      type: String,
      enum: ['hours', 'date', 'guest', 'month'], // Loại vé, có thể là theo giờ hoặc theo ngày
      default: 'guest', // Mặc định là vé theo giờ
    },
    status: {
      type: String,
      enum: ['active', 'used', 'cancelled'],
      default: 'active', // Trạng thái mặc định là 'active'
    },
    checkInTime: Date,
    checkoutTime: Date,
    expiryDate: Date,
    qrCode: {
      type: String,
      required: false, // Có thể sinh tự động khi tạo ticket
    },
    paymentStatus: {
      type: String,
      enum: [],
      default: 'unpaid', // Trạng thái thanh toán mặc định là 'unpaid'
    },
  },
  { timestamps: true }
);

// Middle pre hook save Tự động sinh QR code trước khi lưu ticket
ticketSchema.pre('save', async function (next) {
  if (!this.qrCode) {
    // Nội dung QR là ticketId, bookingId hoặc thông tin khác
    const qrContent = JSON.stringify({
      ticketId: this._id,
      bookingId: this.bookingId,
      userId: this.userId,
      slotNumber: this.slotNumber,
      vehicleNumber: this.vehicleNumber,
      startTime: this.startTime,
      status: this.status,
      expiryDate: this.expiryDate,
      paymentStatus: this.paymentStatus,
      ticketType: this.ticketType,
    });
    this.qrCode = await QRCode.toDataURL(qrContent);
  }
  next();
});

// Đảm bảo mỗi bookingId chỉ có một ticket duy nhất
ticketSchema.index({ bookingId: 1 }, { unique: true });
// Tạo index để tối ưu truy vấn theo userId
ticketSchema.index({ userId: 1 });
// Đảm bảo mã QR code là duy nhất nếu nó tồn tại
ticketSchema.index(
  { qrCode: 1 },
  { unique: true, partialFilterExpression: { qrCode: { $type: 'string' } } }
);

const Ticket = mongoose.model('Ticket', ticketSchema);
export default Ticket;
