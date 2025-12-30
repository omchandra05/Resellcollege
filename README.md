# ResellCollege

A modern, full-stack marketplace platform designed for buying and selling used products, with a focus on college communities. Built with React, Node.js, and real-time features for seamless user experience.

![ResellCollege Logo or Screenshot](https://via.placeholder.com/800x400?text=ResellCollege+Screenshot) <!-- Replace with actual screenshot -->

## 🚀 Features

- **User Authentication**: Secure signup/login with JWT tokens
- **Product Listings**: Add, edit, and manage product listings with images
- **Search & Filters**: Advanced search with category filters and location-based results
- **Real-time Chat**: Instant messaging between buyers and sellers using Socket.io
- **AI-Powered Chatbot**: Integrated AI assistant for user support and recommendations
- **Wishlist**: Save favorite products for later
- **Seller Dashboard**: Comprehensive dashboard for sellers to manage listings and analytics
- **Buyer Profile**: Personalized profile with purchase history
- **3D Interactive Elements**: Engaging 3D scenes using Three.js
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Google Maps Integration**: Location-based features and map views
- **Notifications**: Real-time notifications for messages and updates
- **Dark/Light Theme Toggle**: User preference for theme switching

## 🛠 Tech Stack

### Frontend
- **React 19** - Modern UI library
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Three.js & React Three Fiber** - 3D graphics and animations
- **React Router** - Client-side routing
- **Socket.io Client** - Real-time communication
- **Google Maps API** - Location services
- **Lucide React** - Icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB & Mongoose** - NoSQL database and ODM
- **Socket.io** - Real-time bidirectional communication
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **Google Generative AI** - AI chatbot functionality
- **Winston** - Logging library
- **Express Validator** - Input validation

### DevOps & Deployment
- **Docker** - Containerization
- **Railway** - Cloud deployment platform
- **Nginx** - Reverse proxy for client

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (local or cloud instance)
- **Docker** (optional, for containerized deployment)
- **Git**

## 🔧 Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/resellcollege.git
   cd resellcollege
   ```

2. **Environment Setup:**
   - Copy `.env.example` to `.env` in the root directory
   - Fill in the required environment variables (see `.env.example`)

3. **Install Dependencies:**

   **For the client:**
   ```bash
   cd client
   npm install
   cd ..
   ```

   **For the server:**
   ```bash
   cd server
   npm install
   cd ..
   ```

4. **Database Setup:**
   - Ensure MongoDB is running
   - The server will automatically connect using the `MONGO_URI` in your `.env`

## 🚀 Usage

### Development

1. **Start the backend server:**
   ```bash
   cd server
   npm run dev
   ```
   The server will run on `http://localhost:3000`

2. **Start the frontend client:**
   ```bash
   cd client
   npm run dev
   ```
   The client will run on `http://localhost:5173`

3. **Access the application:**
   Open your browser and navigate to `http://localhost:5173`

### Production

1. **Build the client:**
   ```bash
   cd client
   npm run build
   ```

2. **Using Docker:**
   - Build and run using the provided Dockerfiles
   - For Railway deployment, the `railway.toml` files are configured

## 📡 API Documentation

The API provides endpoints for authentication, products, users, chat, and AI features. Base URL: `http://localhost:3000/api`

### Key Endpoints:

- **Authentication:** `/api/auth`
  - `POST /register` - User registration
  - `POST /login` - User login
  - `POST /logout` - User logout

- **Products:** `/api/products`
  - `GET /` - Get all products
  - `POST /` - Create new product (seller only)
  - `GET /:id` - Get product details
  - `PUT /:id` - Update product (seller only)
  - `DELETE /:id` - Delete product (seller only)

- **Users:** `/api/users`
  - `GET /profile` - Get user profile
  - `PUT /profile` - Update user profile

- **Chat:** `/api/chat`
  - WebSocket connections for real-time messaging

- **AI:** `/api/ai`
  - `POST /chat` - Interact with AI chatbot

For detailed API documentation, refer to the Postman collection or Swagger docs (if implemented).

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

### Development Guidelines
- Follow ESLint rules for code quality
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Om Chandra**

- GitHub: [your-github-username](https://github.com/your-github-username)
- LinkedIn: [your-linkedin-profile](https://linkedin.com/in/your-profile)

## 🙏 Acknowledgments

- Thanks to the open-source community for the amazing tools and libraries
- Special thanks to Vite, React, and the Three.js team for their excellent frameworks

## 📞 Support

If you have any questions or need help, please open an issue on GitHub or contact the maintainers.

---

**Happy Reselling! 🛒**