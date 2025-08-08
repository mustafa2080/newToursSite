<<<<<<< HEAD
# Tours - Tourism Website

A comprehensive tourism website built with React.js, Node.js, Express, and PostgreSQL.

## 🚀 Features

### User Features
- User registration, login, and profile management
- Browse trips and hotels by categories (countries)
- Advanced search and filtering system
- Booking system for trips and hotels
- Review and rating system
- Booking history and management
- Wishlist functionality

### Admin Features
- Complete admin dashboard
- Manage trips, hotels, and categories
- User and booking management
- Content management (About, Contact pages)
- Real-time analytics and reports
- Admin activity logs

### Technical Features
- Responsive design (mobile, tablet, desktop)
- SEO optimized with meta tags and structured data
- High security standards (XSS, CSRF protection)
- Fast loading with lazy loading and optimized images
- Dark/light theme toggle
- Multilingual support (optional)

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Router** - Navigation
- **Axios** - HTTP client
- **React Hook Form** - Form handling

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Multer** - File uploads
- **Helmet** - Security
- **Rate Limiting** - API protection

## 📁 Project Structure

```
tours/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   ├── utils/          # Utility functions
│   │   ├── context/        # React context
│   │   └── assets/         # Static assets
│   ├── public/             # Public assets
│   └── package.json
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Custom middleware
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Utility functions
│   │   └── config/         # Configuration files
│   ├── uploads/            # File uploads
│   └── package.json
└── README.md
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tours
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your database credentials
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Setup Database**
   - Create a PostgreSQL database named 'tours'
   - Update database credentials in backend/.env
   - Run database migrations (will be created)

### Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tours
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
```

## 🎨 Design System

The project uses a consistent color scheme:
- **Primary**: Yellow/Gold theme (#f59e0b)
- **Secondary**: Blue/Gray theme (#64748b)
- **Typography**: Inter font family
- **Components**: Reusable Tailwind CSS classes

## 📱 Responsive Design

The website is fully responsive with breakpoints:
- Mobile: 320px - 768px
- Tablet: 768px - 1024px
- Desktop: 1024px+

## 🔒 Security Features

- JWT authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation and sanitization
- XSS and CSRF protection

## 🚀 Deployment

### Backend Deployment
- Configure production environment variables
- Set up PostgreSQL database
- Deploy to platforms like Heroku, Railway, or DigitalOcean

### Frontend Deployment
- Build the project: `npm run build`
- Deploy to platforms like Vercel, Netlify, or AWS S3

## 📄 API Documentation

API endpoints will be documented as they are created:
- `/api/auth` - Authentication routes
- `/api/users` - User management
- `/api/trips` - Trip management
- `/api/hotels` - Hotel management
- `/api/bookings` - Booking system
- `/api/reviews` - Review system
- `/api/admin` - Admin operations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

This project is licensed under the ISC License.
=======
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
>>>>>>> 4c423c1e61ad675d5d9dbba428518a899d35192d
