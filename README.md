# FreshKart - Food Delivery App

A full-stack food delivery web application built with the **MERN Stack** (MongoDB, Express.js, React, Node.js) with real-time delivery tracking using **Socket.io** and state management via **Redux Toolkit**.

---

## 🚀 Features

-  User Authentication (Register / Login / Forgot Password)
-  Shop / Restaurant browsing by city
-  Browse food items with category filtering
-  Cart management & Checkout
-  Order placement & order history
-  Real-time Delivery Boy tracking via Socket.io
-  Live map integration
-  Owner Dashboard (manage shop, items, orders)
-  User Dashboard (order history, profile)
-  Location-based shop discovery
-  Firebase integration
-  File uploads via Multer

---

## 🛠️ Tech Stack

### Frontend
| Technology | Usage |
|---|---|
| React.js + Vite | UI Framework |
| Redux Toolkit | State Management (user, owner, map slices) |
| React Router | Client-side routing |
| Socket.io Client | Real-time delivery tracking |
| Firebase | Auth / Storage |
| Axios | API requests |

### Backend
| Technology | Usage |
|---|---|
| Node.js + Express.js | Server & REST API |
| MongoDB + Mongoose | Database & Models |
| Socket.io | Real-time communication |
| JWT + bcrypt | Authentication & Security |
| Multer | File / Image uploads |

---

## 📁 Project Structure

```
FOOD-DELIVERY-APP/
│
├── backend/
│   ├── config/                       # DB & app configuration
│   ├── controllers/
│   │   ├── auth.controllers.js
│   │   ├── item.controller.js
│   │   ├── order.controller.js
│   │   ├── shop.controller.js
│   │   └── user.controllers.js
│   ├── middlewares/
│   │   ├── isAuth.js                 # JWT auth middleware
│   │   └── multer.js                 # File upload middleware
│   ├── models/
│   │   ├── deliveryAssignment.model.js
│   │   ├── item.model.js
│   │   ├── order.model.js
│   │   ├── shop.model.js
│   │   └── user.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── item.routes.js
│   │   ├── order.routes.js
│   │   ├── shop.routes.js
│   │   └── user.routes.js
│   ├── utils/
│   ├── public/
│   ├── socket.js                     # Socket.io setup
│   ├── index.js                      # Entry point
│   └── .env
│
└── frontend/
    ├── public/
    └── src/
        ├── assets/
        ├── components/
        │   ├── CartItemCard.jsx
        │   ├── CategoryCard.jsx
        │   ├── DeliveryBoy.jsx
        │   ├── DeliveryBoyTracking.jsx
        │   ├── FoodCard.jsx
        │   ├── NavBar.jsx
        │   ├── OwnerDashboard.jsx
        │   ├── OwnerItemCard.jsx
        │   ├── OwnerOrderCard.jsx
        │   ├── UserDashboard.jsx
        │   └── UserOrderCard.jsx
        ├── context/
        │   └── SocketContext.jsx
        ├── hooks/
        │   ├── useGetCity.jsx
        │   ├── useGetCurrentUser.js
        │   ├── useGetItemsByCity.jsx
        │   ├── useGetMyOrder.jsx
        │   ├── useGetMyShop.jsx
        │   ├── useGetShopByCity.jsx
        │   └── useUpdateLocation.jsx
        ├── pages/
        │   ├── AddFood.jsx
        │   ├── CartPage.jsx
        │   ├── CheckOut.jsx
        │   ├── CreateEditShop.jsx
        │   ├── EditItem.jsx
        │   ├── ForgotPassword.jsx
        │   ├── Home.jsx
        │   ├── ItemDetails.jsx
        │   ├── MyOrders.jsx
        │   ├── OrderPlaced.jsx
        │   ├── Shop.jsx
        │   ├── SignIn.jsx
        │   ├── SignUp.jsx
        │   └── TrackOrderPage.jsx
        ├── redux/
        │   ├── mapSlice.js
        │   ├── ownerSlice.js
        │   ├── store.js
        │   └── userSlice.js
        ├── utils/
        ├── App.jsx
        ├── category.js
        ├── firebase.js
        └── main.jsx
```

---

## ⚙️ Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/) (local or Atlas)
- [Git](https://git-scm.com/)

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/food-delivery-app.git
cd food-delivery-app
```

---

### 2️⃣ Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

Start the backend:

```bash
npm run dev
```

> Server runs at `http://localhost:5000`

---

### 3️⃣ Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend/` folder:

```env
VITE_API_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
```

Start the frontend:

```bash
npm run dev
```

> App runs at `http://localhost:5173`

---

## 📖 Usage

| Role | Capabilities |
|---|---|
| **User** | Sign up, browse shops by city, add items to cart, checkout, track orders live |
| **Owner** | Create/edit shop, add/edit food items, manage incoming orders |
| **Delivery Boy** | Accept delivery assignments, update live GPS location on map |

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/forgot-password` | Forgot password |

### Shop
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/shop` | Get all shops |
| POST | `/api/shop/create` | Create a shop (owner) |
| PUT | `/api/shop/:id` | Update shop (owner) |

### Items
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/item` | Get all items |
| POST | `/api/item/add` | Add food item (owner) |
| PUT | `/api/item/:id` | Edit food item (owner) |

### Orders
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/order` | Place an order |
| GET | `/api/order/my` | Get user's orders |
| PUT | `/api/order/:id` | Update order status |

---

## 🔌 Real-time Events (Socket.io)

| Event | Description |
|---|---|
| `delivery-location` | Delivery boy sends live GPS coordinates |
| `track-order` | User subscribes to track a specific order |
| `order-status` | Order status updates pushed to user in real time |

---

## 📸 Screenshots

### 🏠 Home Page


### 🍽️ Shop / Menu Page


### 🛒 Cart & Checkout


### 📍 Live Order Tracking


---

## 🤝 Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit: `git commit -m "Add your feature"`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request


## 👨‍💻 Author

**Vinayak Ranwat**  
GitHub: [@Vinayak-Ranawat](https://github.com/Vinayak-Ranawat)  

---

> ⭐ If you found this project helpful, give it a star on GitHub!
