# 🌾 FarmConnect

> Bridging the gap between farmers and markets through digital innovation

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Code Quality](https://sonar.server.examly.io/api/project_badges/measure?project=iamneo-production-2_d042574a-e859-4c58-9d86-aeeb23372f94-70ad352c-85b1-4151-823e-0d76251b1329&metric=alert_status)](https://sonar.server.examly.io/dashboard?id=iamneo-production-2_d042574a-e859-4c58-9d86-aeeb23372f94-70ad352c-85b1-4151-823e-0d76251b1329&codeScope=overall)

## 📖 About The Project

FarmConnect is a comprehensive platform designed to empower farmers by providing direct market access for their agricultural produce. The application facilitates seamless connections between farmers and buyers, eliminating middlemen and ensuring fair pricing for quality produce.

### ✨ Key Features

- **🔐 User Authentication & Authorization**
  - Separate registration and login for Farmers and Buyers
  - JWT-based secure authentication
  - Role-based access control

- **👨‍🌾 Farmer Dashboard**
  - Create and manage product listings
  - Upload product images
  - Set prices and available quantities
  - Track order history
  - View buyer inquiries

- **🛒 Buyer Dashboard**
  - Browse available products by category
  - Advanced search and filtering
  - Add products to cart
  - Place orders directly with farmers
  - Order tracking system

- **📦 Product Management**
  - Multi-category support (Vegetables, Fruits, Grains, etc.)
  - Real-time inventory updates
  - Product image gallery
  - Detailed product descriptions

- **💬 Communication System**
  - Direct messaging between farmers and buyers
  - Inquiry management
  - Order-related notifications

- **📊 Analytics Dashboard**
  - Sales analytics for farmers
  - Purchase history for buyers
  - Market trends visualization

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI library for building interactive interfaces
- **Redux / Redux Toolkit** - State management
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Material-UI / Tailwind CSS** - UI component library and styling
- **React Hook Form** - Form validation
- **Chart.js / Recharts** - Data visualization

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication and authorization
- **bcrypt.js** - Password hashing
- **Multer** - File upload handling
- **Cloudinary / AWS S3** - Image storage

### Development Tools
- **Git** - Version control
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Nodemon** - Development server auto-restart
- **Postman** - API testing

## 🏗️ Architecture

### Frontend Architecture
```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── common/          # Reusable components
│   │   ├── farmer/          # Farmer-specific components
│   │   └── buyer/           # Buyer-specific components
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── FarmerDashboard.jsx
│   │   └── BuyerDashboard.jsx
│   ├── redux/
│   │   ├── store.js
│   │   ├── slices/
│   │   │   ├── authSlice.js
│   │   │   ├── productSlice.js
│   │   │   └── cartSlice.js
│   ├── services/
│   │   └── api.js           # API configuration
│   ├── utils/
│   │   └── helpers.js
│   ├── App.js
│   └── index.js
└── package.json
```

### Backend Architecture
```
backend/
├── config/
│   ├── db.js                # Database configuration
│   └── cloudinary.js        # Image upload configuration
├── controllers/
│   ├── authController.js
│   ├── productController.js
│   ├── orderController.js
│   └── userController.js
├── models/
│   ├── User.js
│   ├── Product.js
│   └── Order.js
├── routes/
│   ├── authRoutes.js
│   ├── productRoutes.js
│   ├── orderRoutes.js
│   └── userRoutes.js
├── middleware/
│   ├── auth.js              # Authentication middleware
│   ├── errorHandler.js
│   └── upload.js            # File upload middleware
├── utils/
│   └── validators.js
├── server.js
└── package.json
```

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14.x or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas account)
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ritts17/farmConnect.git
   cd farmConnect
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

3. **Create a `.env` file in the backend directory**
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=30d
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   NODE_ENV=development
   ```

4. **Start the backend server**
   ```bash
   npm run dev
   # OR for production
   npm start
   ```
   The backend server will run on `http://localhost:5000`

5. **Frontend Setup** (Open a new terminal)
   ```bash
   cd frontend
   npm install
   ```

6. **Create a `.env` file in the frontend directory**
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

7. **Start the frontend development server**
   ```bash
   npm start
   ```
   The application will open at `http://localhost:3000`

### Running with Docker (Optional)

```bash
# Build and run with docker-compose
docker-compose up --build

# Stop containers
docker-compose down
```

## 📱 Usage

### For Farmers
1. Register as a Farmer with required details
2. Complete your profile with farm information
3. Add products with images, descriptions, and pricing
4. Manage inventory and update availability
5. Receive and process orders from buyers
6. Track sales and earnings

### For Buyers
1. Register as a Buyer
2. Browse available products by category
3. Use filters to find specific items
4. Add items to cart
5. Place orders and communicate with farmers
6. Track order status and delivery

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test

# Run integration tests
npm run test:integration

# Generate coverage report
npm run test:coverage
```

## 📦 Deployment

### Backend Deployment (Heroku/Railway/Render)
```bash
# Login to your platform
heroku login

# Create new app
heroku create farmconnect-api

# Add MongoDB addon or use MongoDB Atlas
heroku addons:create mongolab

# Deploy
git push heroku main
```

### Frontend Deployment (Vercel/Netlify)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod
```

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

### Development Guidelines
- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 🐛 Bug Reports & Feature Requests

Found a bug or have a feature request? Please open an issue [here](https://github.com/Ritts17/farmConnect/issues) with:
- Clear title and description
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Screenshots if applicable

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Ritts17** - *Initial work* - [Ritts17](https://github.com/Ritts17)

See also the list of [contributors](https://github.com/Ritts17/farmConnect/contributors) who participated in this project.

## 🙏 Acknowledgments

- Inspiration from the need to empower rural farmers
- Thanks to all contributors and supporters
- Built with ❤️ for the farming community

## 📞 Contact & Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/Ritts17/farmConnect/issues)
- **Email**: your.email@example.com
- **Discord**: [Join our community](https://discord.gg/yourserver)

## 🗺️ Roadmap

- [x] Basic authentication system
- [x] Product listing and management
- [x] Order processing
- [ ] Payment gateway integration
- [ ] Mobile application (React Native)
- [ ] Real-time chat system
- [ ] Multi-language support
- [ ] Weather forecasting integration
- [ ] Price prediction using ML
- [ ] Delivery tracking system

## SonarQube

d042574a-e859-4c58-9d86-aeeb23372f94-70ad352c-85b1-4151-823e-0d76251b1329<br/>
https://sonar.server.examly.io/dashboard?id=iamneo-production-2_d042574a-e859-4c58-9d86-aeeb23372f94-70ad352c-85b1-4151-823e-0d76251b1329&amp;codeScope=overall

## 📊 Project Status

![GitHub commit activity](https://img.shields.io/github/commit-activity/m/Ritts17/farmConnect)
![GitHub last commit](https://img.shields.io/github/last-commit/Ritts17/farmConnect)
![GitHub issues](https://img.shields.io/github/issues/Ritts17/farmConnect)
![GitHub pull requests](https://img.shields.io/github/issues-pr/Ritts17/farmConnect)

---

<div align="center">
  Made with ❤️ by the FarmConnect Team
  <br/>
  <strong>Empowering Farmers, Connecting Communities</strong>
</div>
