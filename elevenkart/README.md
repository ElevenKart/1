# ElevenKart - Premium E-commerce Platform

A full-stack e-commerce website built with Next.js, Node.js, MongoDB, and modern web technologies. ElevenKart provides a complete shopping experience with advanced features like partial shipments, return management, and comprehensive admin controls.

## 🚀 Features

### Customer Features
- **Product Catalog**: Browse products across 4 categories (Clothing, Kitchen Items, Kids Toys, Electronics)
- **Advanced Search**: Search with autocomplete and filters (price, brand, ratings, category)
- **Product Variants**: Support for color, size, and material variants
- **Wishlist**: Save favorite products for later
- **Shopping Cart**: Persistent cart with quantity management
- **Checkout**: Complete checkout with address and payment management
- **Order Tracking**: Real-time order status and shipment tracking
- **Returns**: Easy return process with video uploads
- **Reviews & Ratings**: Product reviews with helpful voting
- **Stock Alerts**: Get notified when products are back in stock

### Admin Features
- **Dashboard**: Sales analytics, order management, and inventory overview
- **Product Management**: Add, edit, delete products with bulk import/export
- **Order Management**: Process orders, create partial shipments, handle returns
- **Inventory Control**: Real-time stock management with low stock alerts
- **Customer Management**: View customer data and order history
- **Analytics**: Comprehensive sales and customer analytics
- **CMS**: Blog and announcement management
- **Audit Logs**: Track all admin actions for security

### Technical Features
- **Authentication**: Clerk integration with 2FA for admin
- **Image Management**: Cloudinary integration for optimized images
- **PDF Generation**: Auto-generated invoices and shipping labels
- **Background Jobs**: Inngest for handling async tasks
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **SEO Optimized**: Meta tags, structured data, and performance optimized
- **Security**: Rate limiting, CORS, and input validation

## 🛠 Tech Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **Tailwind CSS**: Utility-first CSS framework
- **Flowbite**: Tailwind component library
- **Clerk**: Authentication and user management
- **React Query**: Data fetching and caching
- **Framer Motion**: Animations and transitions

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **Cloudinary**: Image and video management
- **Inngest**: Background job processing
- **PDFKit**: PDF generation

### Deployment
- **Vercel**: Frontend hosting
- **Render**: Backend hosting
- **MongoDB Atlas**: Cloud database

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd elevenkart
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file:
```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/elevenkart

# Clerk Authentication
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key
CLERK_JWT_KEY=your_jwt_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Inngest
INNGEST_EVENT_KEY=your_inngest_event_key
INNGEST_SIGNING_KEY=your_inngest_signing_key

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create `.env.local` file:
```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 4. Start Development Servers

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm run dev
```

## 🚀 Deployment

### Backend Deployment (Render)

1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables in Render dashboard

### Frontend Deployment (Vercel)

1. Connect your GitHub repository to Vercel
2. Set framework preset to Next.js
3. Add environment variables in Vercel dashboard
4. Deploy

### Database Setup (MongoDB Atlas)

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Set up database access (username/password)
4. Set up network access (IP whitelist)
5. Get connection string and add to environment variables

## 📁 Project Structure

```
elevenkart/
├── frontend/                 # Next.js frontend
│   ├── components/          # React components
│   │   ├── ui/             # UI components
│   │   ├── admin/          # Admin components
│   │   ├── product/        # Product components
│   │   ├── cart/           # Cart components
│   │   └── checkout/       # Checkout components
│   ├── pages/              # Next.js pages
│   │   ├── admin/          # Admin pages
│   │   └── api/            # API routes
│   ├── lib/                # Utilities and API functions
│   ├── styles/             # Global styles
│   └── public/             # Static assets
├── backend/                 # Node.js backend
│   ├── routes/             # API routes
│   ├── models/             # MongoDB models
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Express middleware
│   ├── utils/              # Utility functions
│   └── config/             # Configuration files
└── README.md
```

## 🔧 Configuration

### Clerk Authentication Setup

1. Create a Clerk account
2. Create a new application
3. Configure authentication settings
4. Add your domain to allowed origins
5. Copy API keys to environment variables

### Cloudinary Setup

1. Create a Cloudinary account
2. Get cloud name, API key, and secret
3. Configure upload presets
4. Add credentials to environment variables

### Inngest Setup

1. Create an Inngest account
2. Create a new application
3. Get event key and signing key
4. Add to environment variables

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📊 API Documentation

### Products
- `GET /api/products` - Get all products with filters
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/slug/:slug` - Get product by slug
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Orders
- `GET /api/orders/user/:userId` - Get user orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create order
- `PUT /api/orders/:id/status` - Update order status
- `POST /api/orders/:id/shipments` - Create shipment

### Returns
- `GET /api/returns/user/:userId` - Get user returns
- `POST /api/returns` - Create return request
- `PUT /api/returns/:id/status` - Update return status

## 🔒 Security Features

- **Rate Limiting**: Prevents abuse and DDoS attacks
- **CORS**: Configured for secure cross-origin requests
- **Input Validation**: All inputs validated and sanitized
- **Authentication**: JWT-based authentication with Clerk
- **Authorization**: Role-based access control
- **HTTPS**: SSL/TLS encryption for all communications

## 🚀 Performance Optimizations

- **Image Optimization**: Cloudinary integration for responsive images
- **Caching**: React Query for efficient data caching
- **Code Splitting**: Automatic code splitting with Next.js
- **CDN**: Static assets served via CDN
- **Database Indexing**: Optimized MongoDB queries

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@elevenkart.com or create an issue in the repository.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS
- [Clerk](https://clerk.com/) for authentication
- [Cloudinary](https://cloudinary.com/) for image management
- [MongoDB](https://www.mongodb.com/) for the database
- [Vercel](https://vercel.com/) and [Render](https://render.com/) for hosting

---

**ElevenKart** - Your Premium Shopping Destination 🛍️