// ============================================================================
// AppError: Custom error class dùng để tạo lỗi có kiểm soát trong ứng dụng
// - Kế thừa từ class Error gốc của JavaScript
// - Cho phép truyền vào message và statusCode (mã lỗi HTTP)
// - Thêm thuộc tính status ('fail' cho lỗi 4xx, 'error' cho lỗi 5xx)
// - Đánh dấu lỗi là 'operational' để phân biệt với lỗi lập trình
// - Lưu lại stack trace để dễ dàng debug
// => Sử dụng để ném lỗi trong service/controller và xử lý tập trung ở middleware lỗi
// ============================================================================

class AppError extends Error {
  constructor(message, statusCode) {
    super(message); // Gọi constructor của class Error gốc, truyền vào message
    this.statusCode = statusCode; // Mã trạng thái HTTP, ví dụ: 404, 500, v.v.
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'; // Xác định trạng thái dựa trên mã trạng thái: 4xx là lỗi của người dùng, 5xx là lỗi của server
    this.isOperational = true; // Đánh dấu đây là lỗi do người dùng hoặc hệ thống chủ động kiểm soát (không phải lỗi lập trình)

    // Lưu lại stack trace (vị trí lỗi) để dễ debug
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
