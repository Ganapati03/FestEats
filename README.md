# FestEats - College Fest Food Booking App

A full-stack MERN application for college students to order food during college festivals. Built with React, Node.js, Express, and MongoDB.

## Features

### For Students
- User registration and authentication
- Browse food menu with categories
- Add items to cart and manage quantities
- Place orders with online/cash on delivery payment options
- Track order status and history
- Real-time order updates

### For Admins
- Admin dashboard with authentication
- Manage food menu (add, edit, delete items)
- View and manage all student orders
- Update order status (pending → preparing → delivered)
- Real-time order notifications
- Student details management

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Radix UI** components
- **React Router** for navigation
- **Axios** for API calls
- **Lucide React** for icons

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** for authentication
- **bcryptjs** for password hashing
- **CORS** for cross-origin requests

## Project Structure

```
festeats/
├── backend/
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Authentication & admin middleware
│   ├── models/         # MongoDB schemas
│   ├── routes/         # API routes
│   ├── scripts/        # Database seeding
│   ├── app.js          # Express app setup
│   ├── server.js       # Server entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── context/     # React context for state management
│   │   ├── pages/       # Page components
│   │   ├── styles/      # Global styles
│   │   └── main.tsx     # App entry point
│   ├── public/          # Static assets
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd festeats
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

   Create a `.env` file in the backend directory:
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/festeats?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key-here
   PORT=5000
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

   Create a `.env` file in the frontend directory (for production deployment):
   ```env
   VITE_API_URL=https://your-render-backend-url.onrender.com
   ```

4. **Database Setup**
   - Create a MongoDB Atlas cluster or use local MongoDB
   - Update the `MONGO_URI` in backend/.env
   - Run the seed script to create sample data:
     ```bash
     cd backend
     node scripts/seed.js
     ```

### Running the Application

1. **Start Backend** (from project root)
   ```bash
   cd backend
   npm run dev
   ```
   Backend will run on http://localhost:5000

2. **Start Frontend** (from project root)
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will run on http://localhost:3000

### Sample Accounts

After running the seed script, you can use these accounts:

**Admin Account:**
- Email: `admin@festeats.com`
- Password: `admin123`

**Student Account:**
- Email: `student@festeats.com`
- Password: `student123`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new student
- `POST /api/auth/login` - Login for students and admins

### Food Management (Admin)
- `GET /api/food` - Get all food items
- `POST /api/food/add` - Add new food item
- `PUT /api/food/:id` - Update food item
- `DELETE /api/food/:id` - Delete food item

### Cart Management (Students)
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `POST /api/cart/remove` - Remove item from cart
- `POST /api/cart/update` - Update item quantity
- `DELETE /api/cart/clear` - Clear cart

### Order Management
- `GET /api/orders/my` - Get user's orders (students)
- `GET /api/orders` - Get all orders (admin)
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status (admin)

## Deployment

### Backend (Render)
1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Deploy the backend service

### Frontend (Netlify/Vercel)
1. Build the frontend: `npm run build`
2. Deploy the `dist` folder to Netlify/Vercel
3. Set the `VITE_API_URL` environment variable to your backend URL

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support or questions, please open an issue in the repository.
