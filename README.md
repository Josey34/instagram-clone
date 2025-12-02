# Instagram Clone - MERN Fullstack

A full-stack Instagram clone application built with MongoDB, Express, React, and Node.js.

## Project Structure

```
instagram-clone/
├── client/             # React frontend
├── server/             # Node.js/Express backend
├── .gitignore
├── package.json
└── README.md
```

## Features

### Authentication
- User registration and login
- JWT-based authentication
- Password encryption

### Posts
- Create, read, update, and delete posts
- Image upload support
- Like and comment functionality

### User Profiles
- User profiles with bio and profile picture
- Follow/unfollow users
- User feed with posts from followed users

### Real-time Features
- Real-time notifications
- Live updates using WebSockets (if implemented)

## Tech Stack

### Frontend
- React
- React Router
- Axios
- CSS/Tailwind CSS
- Context API or Redux

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcryptjs (Password hashing)

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or MongoDB Atlas)

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd instagram-clone
```

### 2. Setup Backend

```bash
cd server
npm install
```

Create a `.env` file in the server folder:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/instagram-clone
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

Start the backend server:
```bash
npm start
```

### 3. Setup Frontend

```bash
cd client
npm install
```

Create a `.env` file in the client folder:
```
REACT_APP_API_URL=http://localhost:5000
```

Start the frontend development server:
```bash
npm start
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Posts
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create a post
- `GET /api/posts/:id` - Get single post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile

For detailed API documentation, see [Backend README](./server/README.md)

## Database Schema

### Users
- _id, username, email, password, profile picture, bio, followers, following

### Posts
- _id, author, image, caption, likes, comments, timestamp

### Comments
- _id, post_id, author, text, timestamp

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Development Guidelines

- Use meaningful commit messages
- Follow the existing code style
- Test your changes before submitting a PR
- Update documentation as needed

## Troubleshooting

### Backend won't start
- Check MongoDB connection
- Verify all environment variables are set
- Check if port 5000 is already in use

### Frontend won't connect to backend
- Verify backend is running on port 5000
- Check `REACT_APP_API_URL` in frontend .env file
- Check browser console for CORS errors

## Future Enhancements

- Direct messaging
- Story feature
- Video uploads
- Advanced search
- Hashtag functionality
- Real-time notifications with WebSockets

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions, please create an issue in the repository.
