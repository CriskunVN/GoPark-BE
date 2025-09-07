import ParkingSlot from '../models/parkingSlot.model.js';
import ParkingLot from '../models/parkinglot.model.js';
import Booking from '../models/booking.model.js';
import AppError from '../utils/appError.js';
import { createParkingLot } from '../controllers/parkinglot.controller.js';
// Kiểm tra phương thức thanh toán hợp lệ khi tạo booking
export const isPaymentMethodAllowed = async (parkingSlotId, paymentMethod) => {
    // Lấy thông tin slot
    const slot = await ParkingSlot.findById(parkingSlotId).populate('parkingLot');
    if (!slot)
        throw new AppError('Parking slot not found', 404);
    // Lấy allowedPaymentMethods từ parkingLot
    const lot = slot.parkingLot;
    if (!lot.allowedPaymentMethods.includes(paymentMethod)) {
        throw new AppError('Payment method not allowed for this parking lot', 400);
    }
    return true;
};
//# sourceMappingURL=paymentOption.service.js.map