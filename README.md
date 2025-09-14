# GoPark Backend – Smart Parking API

GoPark Backend là hệ thống API mạnh mẽ cho nền tảng quản lý bãi đỗ xe thông minh, phát triển với **Node.js**, **Express**, **MongoDB** và **Redis**.  
Hệ thống hỗ trợ đặt chỗ, thanh toán, chatbot AI, nhận diện biển số xe tự động, quản lý trạng thái bãi đỗ xe theo thời gian thực và xử lý tác vụ nền hiệu quả.

---

## 🚀 Tính Năng Nổi Bật

- **Quản lý người dùng:** Đăng ký, đăng nhập, phân quyền (admin, chủ bãi, khách)
- **Đặt chỗ linh hoạt:** Đặt theo giờ, ngày, tháng hoặc cho khách vãng lai
- **Thanh toán đa dạng:** Tại bãi, online, tích hợp VNPay
- **Quản lý bãi & chỗ đỗ:** Trạng thái thời gian thực, thống kê, tìm kiếm, lọc
- **Chatbot AI:** Hỗ trợ khách hàng tự động, FAQ, hướng dẫn đặt chỗ (OpenAI/ChatGPT, Dialogflow)
- **Nhận diện biển số:** AI nhận diện biển số xe, tự động check-in/out (có thể mở rộng với microservice Python)
- **Bảo mật:** JWT, Helmet, CORS, kiểm soát truy cập
- **RESTful API:** Chuẩn hóa, dễ tích hợp frontend/mobile
- **Redis Queue:** Xử lý job nền (gửi email, cập nhật trạng thái booking, v.v.)

---

## 🗂️ Cấu Trúc Dự Án

```
src/
├── controllers/      # Xử lý logic API
├── models/           # Định nghĩa schema MongoDB
├── routes/           # Định tuyến API
├── services/         # Xử lý nghiệp vụ
├── jobs/             # Định nghĩa các job (cron, queue)
├── queues/           # Kết nối & quản lý Redis queue
├── workers/          # Worker xử lý job nền
├── utils/            # Tiện ích, xử lý lỗi, template
├── types/            # Định nghĩa type cho TypeScript
├── app.ts            # Khởi tạo app Express
├── server.ts         # Khởi động server
```

---

## 📚 API Chính

- `POST   /api/v1/users/signup` – Đăng ký người dùng
- `POST   /api/v1/users/login` – Đăng nhập
- `POST   /api/v1/bookings/bookingOnline` – Đặt chỗ online
- `POST   /api/v1/bookings/bookingGuest` – Đặt chỗ cho khách vãng lai
- `POST   /api/v1/tickets/:ticketId/checkin` – Check-in vé
- `POST   /api/v1/tickets/:ticketId/checkout` – Check-out vé
- `POST   /api/chatbot` – Chatbot AI hỗ trợ
- `POST   /api/v1/vehicles/recognize-plate` – Nhận diện biển số xe

---

## 🧠 AI & Microservice Integration

- **Chatbot AI:** Tích hợp OpenAI Germini hoặc Dialogflow cho hỗ trợ khách hàng tự động.
- **Nhận diện biển số:** Kết nối microservice Python (Flask/FastAPI, EasyOCR, YOLO, OpenALPR).

---

## 🧩 Redis Logic Diagram

Redis được sử dụng để:

- **Queue:** Xử lý các tác vụ nền như gửi email reset mật khẩu, cập nhật trạng thái booking.
- **Cache:** (Có thể mở rộng) Lưu trữ tạm thời các dữ liệu truy vấn nhiều.
- **Pub/Sub:** (Có thể mở rộng) Đồng bộ trạng thái giữa các service.

### Luồng xử lý ví dụ: Reset mật khẩu qua email

```
User
 │
 │ (1) Gửi yêu cầu reset mật khẩu
 ▼
API Server (Express)
 │
 │ (2) Đẩy job vào Redis Queue
 ▼
Redis (Queue)
 ▲            \
 │ (3) pull    \  (publish/notify) (Pub/Sub)
 │              \
Worker <---------+
 │
 │ (4) Xử lý & gửi email
 ▼
Email Service (SMTP/Resend/etc.)

```

---

## ⚡ Hướng Dẫn Khởi Động

1. **Clone repository**

   ```bash
   git clone https://github.com/CriskunVN/GoPark.git
   cd GoPark/GoPark-BE
   ```

2. **Cài đặt dependencies**

   ```bash
   npm install
   ```

3. **Cấu hình biến môi trường**

   - Tạo file `.env` hoặc `config.env` theo mẫu, điền thông tin MongoDB, Redis, JWT, VNPay...

4. **Chạy server phát triển**
   ```bash
   npm run dev
   ```

---

## 🛠 Scripts

- `npm run dev` – Chạy server với nodemon (dev)
- `npm start` – Chạy server (production)

---

## 📄 License

MIT

---

**GoPark Backend** – Nền tảng bãi đỗ xe thông minh, sẵn sàng cho kỷ nguyên AI 🚀
