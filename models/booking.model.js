
import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    parkingSlotId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ParkingSlot',
        required: true
    }],
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled' , 'completed'],
        default: 'pending'
    },
    price: {
        type: Number,
        default: 0, // Giá tiền tổng cộng cho booking
    },
    paymentStatus: {
        type: String,
        enum: ['paid', 'unpaid'],
        default: 'unpaid'
    },
    paymentMethod: {
        type: String,
        enum: ['pay-at-parking', 'prepaid'],
        default: 'pay-at-parking' // Phương thức thanh toán mặc định
    },
    bookingDate: {
        type: Date,
        default: Date.now // Ngày tạo booking, mặc định là ngày hiện tại
    },
    



 },{ timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;