// tính phí phát sinh cho booking quá hạn (theo phút)
export function calculateOverdueFee(overtimeMinutes: number): number {
  const per10Min: number = 5000;
  return Math.ceil(overtimeMinutes / 10) * per10Min;
}

// Tính tiền và áp dụng giảm giá cho booking
export const calculateTotalPrice = (data: any, slot: any) => {
  let price = 0;
  let discountPercent = 0;
  const startTime = new Date(data.startTime);
  const endTime = new Date(data.endTime);

  if (data.bookingType === 'hours') {
    const hours = Math.ceil(
      (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
    );
    price = slot.pricePerHour * hours;
  } else if (data.bookingType === 'date') {
    const days = Math.ceil(
      (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60 * 24)
    );
    price = slot.pricePerHour * days;
  } else if (data.bookingType === 'month') {
    price = slot.pricePerHour * 30;
    discountPercent = 10; // Giảm 10% cho tháng
  }

  // Áp dụng giảm giá
  price = price * (1 - discountPercent / 100);
  return { price, discountPercent };
};
