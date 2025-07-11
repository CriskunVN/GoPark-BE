// this class is used to build query features for Mongoose
class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  // Method
  filter() {
    //1. Filtering
    // queryString là một object chứa các tham số truy vấn từ URL
    // ví dụ: /api/v1/tours?duration=5&difficulty=easy
    // queryString sẽ là { duration: '5', difficulty: 'easy' }
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    // sẽ loại bỏ các trường 'page', 'sort', 'limit', 'fields'
    excludedFields.forEach((el) => delete queryObj[el]);

    // Thêm xử lý cho tìm kiếm gần đúng với trường 'userName'
    if (queryObj.userName) {
      queryObj.userName = { $regex: queryObj.userName, $options: 'i' }; // 'i' là không phân biệt hoa thường
    }

    // lọc các trường hợp so sánh hơn hoặc bằng, nhỏ hơn hoặc bằng
    // ví dụ: { price: { gte: 100, lte: 500 } } => { price: { $gte: 100, $lte: 500 } }
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`); // <=> '$lt or $gt or $gte or $lte'

    // this.query là một Mongoose Query, nó sẽ tìm kiếm trong cơ sở dữ liệu
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    //2. Sorting
    // queryString.sort là một chuỗi chứa các trường để sắp xếp, ví dụ: 'price,rating'
    // ví dụ: nếu queryString.sort = 'price,rating'
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      // sẽ chuyển đổi thành 'price rating' để Mongoose có thể hiểu
      this.query = this.query.sort(sortBy);

      // nếu không có queryString.sort, mặc định sẽ sắp xếp theo ngày tạo mới nhất
    } else {
      this.query = this.query.sort('-createAt');
    }

    return this;
  }

  limitFields() {
    //3. Fields limitting
    // queryString.fields là một chuỗi chứa các trường để lấy, ví dụ: 'name,price'
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      // sẽ chuyển đổi thành 'name price' để Mongoose có thể hiểu
      this.query = this.query.select(fields);
    } else {
      // nếu không có queryString.fields, mặc định sẽ loại bỏ trường '__v' (version key) của Mongoose
      this.query = this.query.select('-__v');
    }

    return this;
  }

  pagination() {
    //4. Pagination
    // queryString.page và queryString.limit để phân trang
    // || là toán tử OR, nếu không có giá trị thì sẽ mặc định là giá trị bên phải
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    // page = 2 , limit = 10 , skip = 11-20 <=> (2-1) * 10
    // skip là số bản ghi sẽ bỏ qua, limit là số bản ghi sẽ lấy
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}
export default APIFeatures;
