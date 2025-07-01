# GoPark Backend - Express API

This is the **backend API** for the GoPark project, built with **Node.js**, **Express**, and **MongoDB**.

## Features

- RESTful API for user authentication and management
- JWT-based authentication
- Role-based access control (admin, user, etc.)
- Password reset via email (nodemailer)
- Query/filter/sort/pagination for resources
- Secure HTTP headers with Helmet
- CORS enabled for frontend integration

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/CriskunVN/GoPark.git
cd GoPark/backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a file named `.env` or `config.env` in the `backend` folder with the following content:

```
PORT=5000
DATABASE=<your-mongodb-connection-string>
DATABASE_PASSWORD=<your-db-password>
JWT_SECRET=<your-jwt-secret>
JWT_EXPIRES_IN=90d
EMAIL_USERNAME=<your-email>
EMAIL_PASSWORD=<your-email-password>
```

> Replace the values with your actual credentials.

### 4. Run the development server

```bash
npm run dev
```

The server will start on [http://localhost:5000](http://localhost:5000) (or the port you set).

## API Endpoints

- `POST   /api/v1/users/signup` - Register a new user
- `POST   /api/v1/users/login` - Login
- `POST   /api/v1/users/forgotPassword` - Request password reset
- `PATCH  /api/v1/users/resetPassword/:token` - Reset password
- `PATCH  /api/v1/users/updateMyPassword` - Update password (logged in)
- `GET    /api/v1/users/` - Get all users (admin only)
- `GET    /api/v1/users/:id` - Get user by ID (admin only)
- `PATCH  /api/v1/users/:id` - Update user by ID (admin only)
- `DELETE /api/v1/users/:id` - Delete user by ID (admin only)

## Project Structure

```
backend/
├── controllers/
├── models/
├── routes/
├── utils/
├── app.js
├── server.js
└── config.env
```

## Scripts

- `npm run dev` - Start server with nodemon (development)
- `npm start` - Start server (production)

## License

MIT

---

**GoPark Backend** - Developed with ❤️ using Express & MongoDB.