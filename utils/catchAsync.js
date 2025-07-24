// Dùng để bắt lỗi bất đồng bộ trong các hàm xử lý yêu cầu Express
// Hàm này sẽ nhận vào một hàm xử lý yêu cầu và trả về một hàm mới
// Hàm mới này sẽ gọi hàm xử lý yêu cầu và nếu có lỗi xảy ra, nó sẽ chuyển lỗi đó đến middleware xử lý lỗi tiếp theo
// Điều này giúp tránh việc phải sử dụng try-catch trong mỗi hàm xử lý yêu cầu
const catchAsync = (fn) => {
  // fn is a function that returns a promise
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

export default catchAsync;
