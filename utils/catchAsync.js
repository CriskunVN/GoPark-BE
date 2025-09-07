// ============================================================================
// catchAsync: Middleware helper để xử lý lỗi bất đồng bộ trong Express
// - Nhận vào một hàm async (controller hoặc middleware)
// - Trả về một hàm mới tự động bắt lỗi (promise rejection)
// - Nếu có lỗi, tự động chuyển lỗi sang middleware xử lý lỗi tiếp theo (next)
// => Giúp code controller ngắn gọn, không cần lặp lại try-catch
// Ví dụ dùng: router.get('/', catchAsync(async (req, res, next) => { ... }))
// ============================================================================
const catchAsync = (fn) => {
  // fn is a function that returns a promise
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

export default catchAsync;
