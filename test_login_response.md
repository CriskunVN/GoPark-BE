# Kiểm tra Response của Login API

## Thay đổi đã thực hiện:

### 1. Trong `auth.controller.js`:
- **Login function**: Thêm `.select('+password +isActive')` để lấy cả password và isActive từ database
- **createSendToken function**: Giữ nguyên response để isActive được trả về cho frontend
- **refreshToken function**: Thêm `.select('+isActive')` và trả về user data trong response

### 2. Trong `auth.middleware.ts`:
- **protect function**: Thêm `.select('+isActive')` và kiểm tra nếu `isActive === false` thì trả về lỗi

### 3. Trong `user.controller.js`:
- **getCurrentUser function**: Thêm `+isActive` trong select để đảm bảo trường này được trả về

## Cách kiểm tra:

### 1. Đăng nhập với tài khoản có isActive = false:
```json
POST /api/auth/login
{
  "email": "test@example.com", 
  "password": "password123"
}
```

**Response mong đợi khi isActive = false:**
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "data": {
    "user": {
      "_id": "...",
      "userName": "Test User",
      "email": "test@example.com",
      "role": "user",
      "isActive": false,
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
}
```

### 2. Khi sử dụng middleware protect với isActive = false:
**Response lỗi mong đợi:**
```json
{
  "status": "error",
  "message": "Tài khoản của bạn chưa được kích hoạt. Vui lòng kiểm tra email để kích hoạt tài khoản."
}
```

## Lưu ý cho Frontend:
- Frontend có thể check `response.data.user.isActive` để hiển thị thông báo phù hợp
- Nếu isActive = false, nên hướng dẫn user kiểm tra email để kích hoạt tài khoản