import catchAsync from '../utils/catchAsync.js';
import crypto from 'crypto';
import qs from 'qs';
import dayjs from 'dayjs';
import Invoice from '../models/invoice.model.js';
import Booking from '../models/booking.model.js';
import * as bookingService from '../services/booking.service.js';
import * as ticketService from '../services/ticket.service.js';

const FE_SUCCESS_URL =
  process.env.URL_FE_PAYMENT_SUCCESS || 'https://gopark.id.vn/payment/success';

const FE_FAILED_URL =
  process.env.URL_FE_PAYMENT_FAILED || 'https://gopark.id.vn/payment/fail';

function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(
      obj[decodeURIComponent(str[key])]
    ).replace(/%20/g, '+');
  }
  return sorted;
}

// Create Payment URL
export const createPayment = catchAsync(async (req, res) => {
  process.env.TZ = 'Asia/Ho_Chi_Minh';

  const date = new Date();
  const createDate = dayjs(date).format('YYYYMMDDHHmmss');

  // Lấy địa chỉ IP khách hàng
  const ipAddr =
    req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket?.remoteAddress;

  // Lấy cấu hình từ biến môi trường
  const tmnCode = process.env.VNP_TMNCODE;
  const secretKey = process.env.VNP_SECRETKEY;
  const vnpUrl = process.env.VNP_URL;
  const returnUrl = process.env.VNP_RETURN_URL;

  // Lấy thông tin hóa đơn từ cơ sở dữ liệu
  const invoice = await Invoice.findOne({
    invoiceNumber: req.params.invoiceNumber,
  });
  const bankCode = ''; //req.body.bankCode;

  console.log('Invoice-Number:', invoice.invoiceNumber);

  let locale = req.body.language;
  if (!locale) locale = 'vn';

  const currCode = 'VND';
  let vnp_Params = {};
  vnp_Params['vnp_Version'] = '2.1.0';
  vnp_Params['vnp_Command'] = 'pay';
  vnp_Params['vnp_TmnCode'] = tmnCode;
  vnp_Params['vnp_Locale'] = locale;
  vnp_Params['vnp_CurrCode'] = currCode;
  vnp_Params['vnp_TxnRef'] = invoice.invoiceNumber;
  vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma GD:' + invoice.invoiceNumber;
  vnp_Params['vnp_OrderType'] = 'other';
  vnp_Params['vnp_Amount'] = invoice.amount * 100;
  vnp_Params['vnp_ReturnUrl'] = returnUrl;
  vnp_Params['vnp_IpAddr'] = ipAddr;
  vnp_Params['vnp_CreateDate'] = createDate;
  vnp_Params['vnp_ExpireDate'] = dayjs(date)
    .add(15, 'minute')
    .format('YYYYMMDDHHmmss');
  if (bankCode !== null && bankCode !== '') {
    vnp_Params['vnp_BankCode'] = bankCode;
  }

  //Để tạo chữ ký vnp_SecureHash cần sắp xếp các tham số theo thứ tự tăng dần của key
  vnp_Params = sortObject(vnp_Params);

  //Tạo chuỗi ký từ các tham số
  const signData = qs.stringify(vnp_Params, { encode: false });
  // Tạo chữ ký từ chuỗi ký
  const hmac = crypto.createHmac('sha512', secretKey);
  // Ký chuỗi và chuyển sang dạng hex
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
  // Thêm tham số chữ ký vào dữ liệu trả về
  vnp_Params['vnp_SecureHash'] = signed;
  // Tạo URL thanh toán
  const finalUrl = vnpUrl + '?' + qs.stringify(vnp_Params, { encode: false });

  // Nếu muốn redirect luôn:
  // res.redirect(finalUrl);

  // Nếu muốn trả về cho frontend:
  res.status(201).json({
    status: 'success',
    data: {
      paymentUrl: finalUrl,
    },
  });
});

const transactionStatusMessage = {
  '00': 'Giao dịch thành công',
  '01': 'Giao dịch chưa hoàn tất',
  '02': 'Giao dịch bị lỗi',
  '04': 'Giao dịch đảo (Khách hàng đã bị trừ tiền tại Ngân hàng nhưng GD chưa thành công ở VNPAY)',
  '05': 'VNPAY đang xử lý giao dịch này (GD hoàn tiền)',
  '06': 'VNPAY đã gửi yêu cầu hoàn tiền sang Ngân hàng (GD hoàn tiền)',
  '07': 'Giao dịch bị nghi ngờ gian lận',
  '09': 'GD Hoàn trả bị từ chối',
};

export const returnPayment = catchAsync(async (req, res) => {
  // Lấy toàn bộ tham số trả về từ VNPAY
  const vnpParams = { ...req.query };
  // Lấy giá trị tham số chữ ký
  const secureHash = vnpParams.vnp_SecureHash;
  // Xóa tham số chữ ký ra khỏi mảng tham số
  delete vnpParams.vnp_SecureHash;
  delete vnpParams.vnp_SecureHashType;

  const secretKey = process.env.VNP_SECRETKEY;
  const sortedParams = sortObject(vnpParams);
  const signData = qs.stringify(sortedParams, { encode: false });
  const hmac = crypto.createHmac('sha512', secretKey);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  if (secureHash === signed) {
    const invoiceNumber = vnpParams.vnp_TxnRef;
    const responseCode = vnpParams.vnp_ResponseCode;

    const invoice = await Invoice.findOne({ invoiceNumber: invoiceNumber });
    if (!invoice || invoice.status === 'paid') {
      return res
        .status(200)
        .json({ RspCode: '02', Message: transactionStatusMessage['02'] });
    }

    switch (responseCode) {
      case '00':
        invoice.status = 'paid';
        await invoice.save();

        const booking = await Booking.findById(invoice.bookingId);
        if (booking) {
          booking.status = 'confirmed';
          booking.paymentStatus = 'paid';
          await booking.save();
        }
        const getBookingWithSlot = await bookingService.getBookingWithSlot(
          invoice.bookingId
        );
        const slotNumber = getBookingWithSlot.parkingSlotId.slotNumber;
        console.log('Slot Number:', slotNumber);
        // sinh vé
        const ticket = await ticketService.createTicket({
          bookingId: booking._id,
          userId: booking.userId,
          slotNumber: slotNumber,
          vehicleNumber: booking.vehicleSnapshot.number,
          ticketType: booking.bookingType,
          startTime: booking.startTime,
          expiryDate: booking.endTime,
          paymentStatus: 'paid',
        });

        const redirectUrl =
          FE_SUCCESS_URL +
          '?invoiceNumber=' +
          encodeURIComponent(invoice.invoiceNumber) +
          '&amount=' +
          encodeURIComponent(invoice.amount) +
          '&bookingId=' +
          encodeURIComponent(booking._id.toString()) +
          '&ticketId=' +
          encodeURIComponent(ticket._id.toString()) +
          '&slotNumber=' +
          encodeURIComponent(slotNumber) +
          '&vehicleNumber=' +
          encodeURIComponent(booking.vehicleSnapshot.number);

        return res.redirect(302, redirectUrl);
      case '01':
        // xóa hóa đơn nếu thanh toán không thành công
        await Invoice.findByIdAndDelete(invoice._id);

        // xóa booking liên quan
        await Booking.findByIdAndDelete(invoice.bookingId);

        return res.status(200).json({
          status: 'fail',
          RspCode: '01',
          Message: transactionStatusMessage['01'],
        });

      case '02':
        // xóa hóa đơn nếu thanh toán không thành công
        await Invoice.findByIdAndDelete(invoice._id);

        // xóa booking liên quan
        await Booking.findByIdAndDelete(invoice.bookingId);

        return res.redirect(302, FE_FAILED_URL);
      default:
        return res.redirect(302, FE_FAILED_URL);
    }
  } else {
    return res
      .status(200)
      .json({ status: 'fail', RspCode: '97', Message: 'Invalid signature' });
  }
});
