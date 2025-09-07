import mongoose from 'mongoose';
import QRCode from 'qrcode'; // Thư viện để tạo QR code
const ticketSchema = new mongoose.Schema({
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
    parkingSlotId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ParkingSlot',
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
        enum: ['pending', 'active', 'used', 'cancelled', 'expired'],
        default: 'pending', // Trạng thái mặc định là 'active'
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
        enum: ['paid', 'unpaid'],
        default: 'unpaid', // Trạng thái thanh toán mặc định là 'unpaid'
    },
}, { timestamps: true });
// Middle pre hook save Tự động sinh QR code trước khi lưu ticket
ticketSchema.pre('save', async function (next) {
    if (!this.qrCode) {
        // Nội dung QR là ticketId, bookingId hoặc thông tin khác
        const qrContent = JSON.stringify({
            ticketId: this._id,
            bookingId: this.bookingId,
            userId: this.userId,
            parkingSlotId: this.parkingSlotId,
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
const Ticket = mongoose.model('Ticket', ticketSchema);
export default Ticket;
//# sourceMappingURL=ticket.models.js.map