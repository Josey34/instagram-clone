# Instagram Clone API Documentation

Base URL: `http://localhost:3000/api`

## Table of Contents

1. [Authentication](#authentication)
2. [Users](#users)
3. [Posts](#posts)
4. [Comments](#comments)
5. [Stories](#stories)
6. [Upload](#upload)
7. [Error Responses](#error-responses)

---

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Register User

**POST** `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "username": "johndoe",
  "fullname": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Validation:**
- `username`: 3-30 characters, alphanumeric with dots/underscores only
- `fullname`: 1-50 characters
- `email`: Valid email format
- `password`: Minimum 6 characters

**Success Response (201):**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userWithoutPassword": {
    "_id": "user_id",
    "username": "johndoe",
    "email": "john@example.com",
    "fullname": "John Doe"
  }
}
```

**Rate Limit:** 5 requests per 15 minutes

---

### Login User

**POST** `/auth/login`

Authenticate a user and receive a JWT token.

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "message": "User logged in successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "user_id",
    "username": "johndoe",
    "email": "john@example.com",
    "fullname": "John Doe",
    "profilePicture": "url",
    "bio": "",
    "followers": [],
    "following": [],
    "followersCount": 0,
    "followingCount": 0
  }
}
```

**Rate Limit:** 5 requests per 15 minutes

---

### Forgot Password

**POST** `/auth/forgot-password`

Request a password reset link via email.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Success Response (200):**
```json
{
  "message": "If that email exists, a password reset link has been sent"
}
```

**Note:** For security, the response is the same whether the email exists or not.

**Rate Limit:** 5 requests per 15 minutes

---

### Reset Password

**POST** `/auth/reset-password/:token`

Reset password using the token from email.

**URL Parameters:**
- `token`: Reset token from email

**Request Body:**
```json
{
  "password": "newPassword123"
}
```

**Validation:**
- `password`: Minimum 6 characters

**Success Response (200):**
```json
{
  "message": "Password reset successful"
}
```

**Rate Limit:** 5 requests per 15 minutes

---

## Users

### Get Current User Profile

**GET** `/users/profile`

Get the authenticated user's profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "_id": "user_id",
  "username": "johndoe",
  "fullname": "John Doe",
  "email": "john@example.com",
  "profilePicture": "url",
  "bio": "My bio",
  "followers": ["user_id_1", "user_id_2"],
  "following": ["user_id_3"],
  "savedPosts": ["post_id_1"],
  "followersCount": 2,
  "followingCount": 1,
  "postsCount": 5
}
```

---

### Update Profile

**PUT** `/users/profile`

Update the authenticated user's profile.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data (if uploading file)
```

**Request Body (multipart or JSON):**
```json
{
  "fullname": "John Updated",
  "bio": "New bio text",
  "profilePicture": "https://cloudinary.com/..." // or upload file
}
```

Or with file upload:
- `fullname`: (text field)
- `bio`: (text field)
- `profilePicture`: (file field)

**Success Response (200):**
```json
{
  "_id": "user_id",
  "username": "johndoe",
  "fullname": "John Updated",
  "bio": "New bio text",
  "profilePicture": "updated_url"
}
```

---

### Get User by ID

**GET** `/users/:id`

Get a user's public profile.

**URL Parameters:**
- `id`: User ID

**Success Response (200):**
```json
{
  "_id": "user_id",
  "username": "johndoe",
  "fullname": "John Doe",
  "profilePicture": "url",
  "bio": "My bio",
  "followersCount": 100,
  "followingCount": 50,
  "postsCount": 25
}
```

---

### Follow User

**POST** `/users/follow/:id`

Follow a user.

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `id`: User ID to follow

**Success Response (200):**
```json
{
  "message": "User followed successfully"
}
```

---

### Unfollow User

**POST** `/users/unfollow/:id`

Unfollow a user.

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `id`: User ID to unfollow

**Success Response (200):**
```json
{
  "message": "User unfollowed successfully"
}
```

---

### Search Users

**GET** `/users/search?query=john`

Search for users by username or fullname.

**Query Parameters:**
- `query`: Search term (minimum 1 character)

**Success Response (200):**
```json
[
  {
    "_id": "user_id",
    "username": "johndoe",
    "fullname": "John Doe",
    "bio": "My bio"
  }
]
```

---

## Posts

### Create Post

**POST** `/posts`

Create a new post.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (multipart):**
- `caption`: (text field, optional)
- `image`: (file field, required) OR
- `image`: (text field with URL)

**Success Response (201):**
```json
{
  "message": "Post created successfully",
  "post": {
    "_id": "post_id",
    "user": "user_id",
    "caption": "My post caption #hashtag",
    "image": "cloudinary_url",
    "hashtag": ["hashtag"],
    "likes": [],
    "likesCount": 0,
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

**Rate Limit:** 30 requests per hour

---

### Get All Posts

**GET** `/posts?page=1&limit=10`

Get all posts with pagination.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Success Response (200):**
```json
{
  "posts": [
    {
      "_id": "post_id",
      "user": {
        "_id": "user_id",
        "username": "johndoe",
        "profilePicture": "url"
      },
      "caption": "Post caption",
      "image": "url",
      "hashtag": ["tag1", "tag2"],
      "likes": [],
      "likesCount": 5,
      "commentsCount": 3,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalPosts": 50,
    "hasMore": true
  }
}
```

---

### Get Feed

**GET** `/posts/feed?page=1&limit=10`

Get personalized feed (posts from followed users + suggested posts).

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Success Response (200):**
```json
{
  "posts": [...],
  "pagination": {...}
}
```

---

### Get User Posts

**GET** `/posts/user/:userId?page=1&limit=10`

Get all posts by a specific user.

**URL Parameters:**
- `userId`: User ID

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Success Response (200):**
```json
{
  "posts": [...],
  "pagination": {...}
}
```

---

### Get Single Post

**GET** `/posts/:id`

Get a single post by ID.

**URL Parameters:**
- `id`: Post ID

**Success Response (200):**
```json
{
  "_id": "post_id",
  "user": {
    "_id": "user_id",
    "username": "johndoe",
    "profilePicture": "url"
  },
  "caption": "Post caption",
  "image": "url",
  "hashtag": ["tag1"],
  "likes": ["user_id_1", "user_id_2"],
  "likesCount": 2,
  "commentsCount": 5,
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

---

### Update Post

**PUT** `/posts/:id`

Update a post (caption only).

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `id`: Post ID

**Request Body:**
```json
{
  "caption": "Updated caption #newtag"
}
```

**Success Response (200):**
```json
{
  "message": "Post updated successfully",
  "post": {...}
}
```

---

### Delete Post

**DELETE** `/posts/:id`

Delete a post.

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `id`: Post ID

**Success Response (200):**
```json
{
  "message": "Post deleted successfully"
}
```

---

### Like Post

**POST** `/posts/:id/like`

Like a post.

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `id`: Post ID

**Success Response (200):**
```json
{
  "message": "Post liked successfully"
}
```

---

### Unlike Post

**DELETE** `/posts/:id/like`

Unlike a post.

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `id`: Post ID

**Success Response (200):**
```json
{
  "message": "Post unliked successfully"
}
```

---

### Search Posts

**GET** `/posts/search?query=hashtag`

Search posts by caption or hashtag.

**Query Parameters:**
- `query`: Search term

**Success Response (200):**
```json
[
  {
    "_id": "post_id",
    "user": {...},
    "caption": "Post with #hashtag",
    "image": "url",
    "hashtag": ["hashtag"],
    "likesCount": 10,
    "commentsCount": 5
  }
]
```

---

## Comments

### Add Comment

**POST** `/comments/:postId`

Add a comment to a post.

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `postId`: Post ID

**Request Body:**
```json
{
  "text": "Great post!"
}
```

**Success Response (201):**
```json
{
  "message": "Comment added successfully",
  "comment": {
    "_id": "comment_id",
    "post": "post_id",
    "user": {
      "_id": "user_id",
      "username": "johndoe",
      "profilePicture": "url"
    },
    "text": "Great post!",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

**Rate Limit:** 30 requests per hour

---

### Get Post Comments

**GET** `/comments/:postId?page=1&limit=20`

Get all comments for a post.

**URL Parameters:**
- `postId`: Post ID

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Success Response (200):**
```json
{
  "comments": [
    {
      "_id": "comment_id",
      "user": {
        "_id": "user_id",
        "username": "johndoe",
        "profilePicture": "url"
      },
      "text": "Great post!",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 2,
    "totalComments": 25,
    "hasMore": true
  }
}
```

---

### Delete Comment

**DELETE** `/comments/:id`

Delete a comment.

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `id`: Comment ID

**Success Response (200):**
```json
{
  "message": "Comment deleted successfully"
}
```

---

## Stories

### Create Story

**POST** `/stories`

Create a new story (expires in 24 hours).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (multipart):**
- `image`: (file field, required) OR
- `image`: (text field with URL)

**Success Response (201):**
```json
{
  "message": "Story created successfully",
  "story": {
    "_id": "story_id",
    "user": {
      "_id": "user_id",
      "username": "johndoe",
      "profilePicture": "url"
    },
    "image": "cloudinary_url",
    "viewedBy": [],
    "expiresAt": "2025-01-02T00:00:00.000Z",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

**Rate Limit:** 30 requests per hour

---

### Get Following Stories

**GET** `/stories`

Get stories from followed users and own stories.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
[
  {
    "_id": "story_id",
    "user": {
      "_id": "user_id",
      "username": "johndoe",
      "profilePicture": "url"
    },
    "image": "url",
    "viewedBy": ["user_id_1"],
    "expiresAt": "2025-01-02T00:00:00.000Z",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
]
```

---

### Get User Stories

**GET** `/stories/user/:id`

Get all active stories from a specific user.

**URL Parameters:**
- `id`: User ID

**Success Response (200):**
```json
[
  {
    "_id": "story_id",
    "user": {...},
    "image": "url",
    "viewedBy": [],
    "expiresAt": "2025-01-02T00:00:00.000Z"
  }
]
```

---

### View Story

**GET** `/stories/:id/view`

View a story (marks as viewed by current user).

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `id`: Story ID

**Success Response (200):**
```json
{
  "_id": "story_id",
  "user": {...},
  "image": "url",
  "viewedBy": ["user_id_1", "current_user_id"],
  "expiresAt": "2025-01-02T00:00:00.000Z"
}
```

---

### Delete Story

**DELETE** `/stories/:id`

Delete a story.

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `id`: Story ID

**Success Response (200):**
```json
{
  "message": "Story deleted successfully"
}
```

---

## Upload

### Upload Image

**POST** `/upload?type=general`

Upload an image to Cloudinary.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Query Parameters:**
- `type`: Folder type (e.g., `profile`, `posts`, `stories`, `general`)

**Request Body (multipart):**
- `image`: (file field, required)

**Success Response (200):**
```json
{
  "message": "Image uploaded successfully",
  "url": "https://res.cloudinary.com/..."
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Not authorized to perform this action"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 429 Too Many Requests
```json
{
  "message": "Too many requests from this IP, please try again later."
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Server Error"
}
```

In development mode (`NODE_ENV=development`), error responses include a stack trace.

---

## Rate Limits

- **Authentication endpoints** (`/auth/*`): 5 requests per 15 minutes
- **Create endpoints** (posts, comments, stories): 30 requests per hour
- **General API**: 100 requests per 15 minutes

Rate limit information is included in response headers:
- `RateLimit-Limit`: Maximum requests allowed
- `RateLimit-Remaining`: Requests remaining
- `RateLimit-Reset`: Time when the limit resets

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- File uploads support common image formats (JPEG, PNG, GIF, WebP)
- Maximum file size: determined by Cloudinary configuration
- Images are automatically optimized (max 1080x1080, auto quality, WebP when supported)
- Hashtags are automatically extracted from post captions
- Stories automatically expire after 24 hours
- Password reset tokens expire after 1 hour