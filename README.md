# GoPark Backend – Smart Parking API

This is the **backend API** for the GoPark project, built with **Node.js**, **Express**, and **MongoDB**.  
GoPark is a smart parking management platform supporting booking, payment, AI-powered chatbot, and automatic license plate recognition.

---

## ✨ Key Features

- **User management:** Registration, login, role-based access (admin, owner, guest)
- **Flexible booking:** Book by hour, day, month, or as a guest
- **Multiple payment methods:** Pay at parking, online payment, VNPay integration
- **Parking lot & slot management:** Real-time status, statistics, search, and filtering
- **AI Chatbot:** Automated customer support, FAQ, and booking guidance (OpenAI/ChatGPT or Dialogflow integration)
- **License plate recognition:** AI-powered license plate analysis for automatic check-in/out (easy to extend with Python microservice)
- **Security:** JWT, Helmet, CORS, access control
- **RESTful API:** Standardized, easy to integrate with frontend/mobile apps

---

## 🚀 Getting Started

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

> Replace the values with your actual credentials.

### 4. Run the development server

```bash
npm run dev
```

The server will start on [http://localhost:5000](http://localhost:5000) (or the port you set).

---

## 📚 Main API Endpoints

- `POST   /api/v1/users/signup` – Register a new user
- `POST   /api/v1/users/login` – Login
- `POST   /api/v1/bookings/bookingOnline` – Online booking
- `POST   /api/v1/bookings/bookingGuest` – Guest booking
- `POST   /api/v1/tickets/:ticketId/checkin` – Ticket check-in
- `POST   /api/v1/tickets/:ticketId/checkout` – Ticket check-out
- `POST   /api/chatbot` – AI chatbot support
- `POST   /api/v1/vehicles/recognize-plate` – License plate recognition (AI)

---

## 🗂️ Project Structure

```
backend/
├── controllers/
├── models/
├── routes/
├── services/
├── utils/
├── app.js
├── server.js
└── config.env
```

---

## 🧠 AI Integration (Extension Ideas)

- **AI Chatbot:** Integrate OpenAI GPT or Dialogflow for automated customer support.
- **License Plate Recognition:** Connect to a Python microservice (Flask/FastAPI) using EasyOCR, YOLO, or OpenALPR.

---

## Scripts

- `npm run dev` – Start server with nodemon (development)
- `npm start` – Start server (production)

---

## License

MIT

---

**GoPark Backend** – Smart parking platform, ready for the AI era 🚀
