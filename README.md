# CourseFlow — Server

This is the backend API for **CourseFlow**, a full-stack e-learning and course marketplace platform. It's built with Express.js and MongoDB (native driver), and handles authentication, course data, payments, and wishlists for the CourseFlow client.

🔗 **Frontend Repository:** https://github.com/Kz-Himel/courseflow-client
🔗 **Live API:** https://courseflow-server-kzhimel.vercel.app/

---

## ✨ Features

- 🔐 **Authentication** — Session/JWT verification via [Better Auth](https://www.better-auth.com/)
- 📚 **Course APIs** — Create, update, delete, and fetch course listings
- 💳 **Payments** — Stripe integration for secure course purchases
- ❤️ **Wishlist APIs** — Add/remove/fetch saved courses per user
- 🧑‍🏫 **Role-based Access** — Middleware-enforced permissions for creators vs. learners
- 🗄️ **Native MongoDB Driver** — Direct `db.collection()` queries, no ORM/Mongoose overhead

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Runtime | [Node.js](https://nodejs.org/) |
| Framework | [Express.js](https://expressjs.com/) (TypeScript) |
| Database | [MongoDB](https://www.mongodb.com/) (native driver) |
| Auth | [Better Auth](https://www.better-auth.com/) |
| Payments | [Stripe](https://stripe.com/) |

---

## 📁 Project Structure

```
server/
├── src/
│   ├── config/          # DB connection, env setup
│   ├── middleware/       # verifyToken, error handlers
│   ├── routes/           # Express route definitions
│   ├── controllers/      # Route handler logic
│   └── index.ts          # App entry point
├── .env
└── package.json
```

> Adjust this tree to match your actual folder layout if it differs.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- A [MongoDB](https://www.mongodb.com/) instance (local or Atlas)
- A [Stripe](https://dashboard.stripe.com/) account

### 1. Clone the repository

```bash
git clone https://github.com/your-username/courseflow-server.git
cd courseflow-server
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
BETTER_AUTH_SECRET=your_better_auth_secret
BETTER_AUTH_URL=http://localhost:5000
STRIPE_SECRET_KEY=your_stripe_secret_key
CLIENT_URL=http://localhost:3000
```

### 4. Run the development server

```bash
npm run dev
```

The API will be available at `http://localhost:5000`.

---

## 🔑 Authentication Flow

- Client sends requests with a JWT obtained via Better Auth
- The `verifyToken` middleware validates the token on protected routes
- Verified requests expose the authenticated user via `req.user?.email`

---

## 📡 API Overview

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/*` | Better Auth handlers |
| `GET` | `/api/courses` | Fetch all courses |
| `GET` | `/api/courses/:id` | Fetch a single course |
| `POST` | `/api/courses` | Create a course *(creator only)* |
| `PATCH` | `/api/courses/:id` | Update a course *(owner only)* |
| `DELETE` | `/api/courses/:id` | Delete a course *(owner only)* |
| `GET` | `/api/wishlist` | Get current user's wishlist |
| `POST` | `/api/wishlist/:courseId` | Add course to wishlist |
| `DELETE` | `/api/wishlist/:courseId` | Remove course from wishlist |
| `POST` | `/api/payments/checkout` | Create a Stripe checkout session |

> Update this table to reflect your actual routes.

---

## 🤝 Contributing

This is currently a solo/independent project. Issues and pull requests are welcome.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 👤 Author

**Kamrul Himel**
Frontend-leaning Full-Stack Developer, Bangladesh

- Portfolio: _add your link here_
- GitHub: _add your link here_
