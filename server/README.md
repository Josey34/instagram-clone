# Instagram Clone - Backend API

A full-featured Instagram clone backend API built with Node.js, Express, and MongoDB.

## Features

- **Authentication & Authorization**
  - User registration and login with JWT
  - Password reset via email
  - Rate limiting on auth endpoints

- **User Management**
  - User profiles with bio and profile pictures
  - Follow/unfollow users
  - Update profile information
  - User search

- **Posts**
  - Create posts with images and captions
  - Like/unlike posts
  - Delete posts
  - Automatic hashtag extraction
  - Post search
  - Enhanced feed (following + suggested posts)

- **Comments**
  - Add comments to posts
  - Delete comments
  - Pagination support

- **Stories**
  - Create stories with images
  - 24-hour auto-expiration
  - View stories from followed users
  - Track story viewers

- **Media Upload**
  - Cloudinary integration for image storage
  - Automatic image optimization
  - Support for posts, stories, and profile pictures

- **Security**
  - Helmet.js for security headers
  - Rate limiting (authentication, creation endpoints)
  - Input validation with express-validator
  - Password hashing with bcrypt
  - JWT token authentication

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (jsonwebtoken)
- **File Upload:** Multer + Cloudinary
- **Email:** Nodemailer (Gmail)
- **Security:** Helmet, express-rate-limit, express-validator
- **Password Hashing:** bcryptjs

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Cloudinary account
- Gmail account with app password (for email features)

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd instagram-clone/server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your actual values:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A random secret key for JWT
   - `CLOUDINARY_*`: Your Cloudinary credentials
   - `EMAIL_USER` & `EMAIL_APP_PASSWORD`: Gmail credentials
   - `FRONTEND_URL`: Your frontend URL

4. **Start the server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3000`

## Environment Variables

See `.env.example` for all required environment variables.

### Gmail App Password Setup

1. Enable 2-Factor Authentication on your Gmail account
2. Go to https://myaccount.google.com/apppasswords
3. Generate an app password for "Mail"
4. Use the 16-character password in `EMAIL_APP_PASSWORD`

## API Documentation

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for detailed API endpoints and usage.

### Quick API Reference

**Base URL:** `http://localhost:3000/api`

#### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password/:token` - Reset password

#### Users
- `GET /users/profile` - Get current user profile
- `PUT /users/profile` - Update profile
- `GET /users/:id` - Get user by ID
- `POST /users/follow/:id` - Follow user
- `POST /users/unfollow/:id` - Unfollow user
- `GET /users/search?query=` - Search users

#### Posts
- `POST /posts` - Create post
- `GET /posts` - Get all posts (paginated)
- `GET /posts/feed` - Get personalized feed
- `GET /posts/user/:userId` - Get user's posts
- `GET /posts/:id` - Get single post
- `PUT /posts/:id` - Update post
- `DELETE /posts/:id` - Delete post
- `POST /posts/:id/like` - Like post
- `DELETE /posts/:id/like` - Unlike post
- `GET /posts/search?query=` - Search posts

#### Comments
- `POST /comments/:postId` - Add comment
- `GET /comments/:postId` - Get post comments
- `DELETE /comments/:id` - Delete comment

#### Stories
- `POST /stories` - Create story
- `GET /stories` - Get following stories
- `GET /stories/user/:id` - Get user stories
- `GET /stories/:id/view` - View story
- `DELETE /stories/:id` - Delete story

#### Upload
- `POST /upload?type=` - Upload image

## Project Structure

```
server/
├── config/
│   ├── db.js              # MongoDB connection
│   ├── email.js           # Email transporter configuration
│   └── rateLimiter.js     # Rate limiting configuration
├── controllers/
│   ├── authController.js
│   ├── commentController.js
│   ├── postController.js
│   ├── storyController.js
│   ├── uploadController.js
│   └── userController.js
├── middleware/
│   ├── auth.js            # JWT authentication middleware
│   ├── errorHandler.js    # Error handling middleware
│   ├── upload.js          # Multer configuration
│   └── validation.js      # Express-validator middleware
├── models/
│   ├── Comment.js
│   ├── Post.js
│   ├── Story.js
│   └── User.js
├── routes/
│   ├── auth.js
│   ├── comment.js
│   ├── post.js
│   ├── story.js
│   ├── upload.js
│   └── user.js
├── utils/
│   ├── emailTemplates.js  # HTML email templates
│   ├── extractHashtag.js  # Hashtag extraction utility
│   ├── formatDateTime.js  # Date formatting utilities
│   └── sendEmail.js       # Email sending utility
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── server.js              # Entry point
```

## Rate Limits

- **Authentication endpoints:** 5 requests per 15 minutes
- **Create endpoints (posts/comments/stories):** 30 requests per hour
- **General API:** 100 requests per 15 minutes

## Security Features

- JWT-based authentication
- Password hashing with bcrypt (10 rounds)
- Rate limiting on sensitive endpoints
- Input validation and sanitization
- Security headers with Helmet
- CORS enabled
- Secure password reset with hashed tokens (1-hour expiration)

## Development

```bash
npm run dev
```

This starts the server with nodemon for auto-restart on file changes.

## Testing

Use tools like:
- **Insomnia** or **Postman** for API testing
- **MongoDB Compass** for database inspection

## Deployment

1. Set `NODE_ENV=production` in your environment
2. Use a production MongoDB database (MongoDB Atlas recommended)
3. Set secure `JWT_SECRET`
4. Configure production email service
5. Deploy to platforms like:
   - Railway
   - Render
   - Heroku
   - DigitalOcean
   - AWS/Azure

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

ISC

## Author

Josey Alexander Takesan

## Acknowledgments

- Express.js documentation
- MongoDB documentation
- Cloudinary API
- Nodemailer documentation
