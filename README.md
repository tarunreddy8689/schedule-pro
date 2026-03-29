# 📅 Schedule Pro – Modern Scheduling Platform

A modern, full-stack scheduling platform that allows users to set availability and share a booking link so others can easily schedule meetings — eliminating back-and-forth communication.

Built with React, Node.js, and MongoDB with a beautiful, responsive UI similar to Calendly.


## 🛠️ Tech Stack

### Frontend

* React (Vite)
* Tailwind CSS
* Axios
* React Router

### Backend

* Node.js
* Express.js
* MongoDB (Mongoose)
* JWT Authentication
* Bcrypt (password hashing)

---

## ✨ Features

* 🔐 User Registration & Login
* 📅 Set Availability (days & time slots)
* 🔗 Unique Booking Link (`/book/:username`)
* 📌 Book Appointments
* 🚫 Prevent Double Booking
* 📊 Simple Dashboard
* 📱 Responsive UI

---

## 🧠 Key Design Decisions

* Used **React + Express** for faster development and modular structure
* Used **MongoDB** for flexible schema and quick setup
* Used **JWT** for secure authentication
* Designed as a **monorepo** (frontend + backend in one project)

---

## ⚠️ Assumptions

* Basic availability (no recurring complex schedules)
* Timezone handled using browser local time (MVP)
* Calendar integration simplified (no OAuth)

---

## 🤖 Use of AI / LLM

* Used ChatGPT for:

  * Debugging issues
  * Designing API structure
  * UI layout suggestions

---

## 📁 Project Structure

```
project-root/
 ├── backend/
 │    ├── controllers/
 │    ├── models/
 │    ├── routes/
 │    └── server.js
 │
 ├── frontend/
 │    ├── src/
 │    │    ├── pages/
 │    │    ├── services/
 │    │    └── App.jsx
 │
 └── README.md
```

---

## ⚙️ Installation & Setup

### 1. Clone the repository

```
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

---

### 2. Backend Setup

```
cd backend
npm install
```

Create `.env` file:

```
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret
```

Run backend:

```
npm run dev
```

---

### 3. Frontend Setup

```
cd frontend
npm install
npm run dev
```

---

## 🔗 API Endpoints

### Auth

* `POST /api/auth/register`
* `POST /api/auth/login`

### Availability

* `POST /api/availability`
* `GET /api/availability/:username`

### Booking

* `POST /api/book`
* `GET /api/book/:userId`

---

## 🚀 Deployment

* Frontend deployed on Vercel
* Backend deployed on Render

---

## 🔐 Security

* Password hashing using bcrypt
* JWT-based authentication
* Basic input validation

---

## 📌 Future Improvements

* Google Calendar integration (OAuth)
* Advanced timezone handling
* Email notifications
* UI enhancements
* Recurring availability

---

## 🙌 Conclusion

This project demonstrates the ability to design and build a full-stack application with real-world features such as authentication, scheduling logic, and deployment.

---

## 👤 Author

Tarun Reddy
