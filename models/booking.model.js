
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
    startTime: {
        type: Date,
        default: Date.now(), // Mặc định là thời gian hiện tại nếu không được cung cấp
        required: true // Ngày bắt đầu là bắt buộc
    },
    endTime: {
        type: Date,
        required: true // Ngày kết thúc là bắt buộc
    },
    vehicleNumber: {
        type: String,
        required: true, // Số xe là bắt buộc
        trim: true // Loại bỏ khoảng trắng thừa
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
    bookingType:{
        type: String,
        enum: ['date', 'hour'], // Loại booking, có thể là theo ngày hoặc theo giờ
        default: 'hour' // Mặc định là booking theo ngày
    },



 },{ timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;