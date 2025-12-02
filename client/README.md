# Instagram Clone - Frontend

A modern Instagram clone frontend built with React, TypeScript, and Vite. Features a responsive UI with dark mode support, real-time updates, and a complete social media experience.

## Features

- **Authentication**
  - User registration and login
  - JWT token-based authentication
  - Protected routes
  - Password reset functionality

- **User Features**
  - User profiles with bio and profile pictures
  - Follow/unfollow users
  - Edit profile (name, bio, profile picture)
  - Search users
  - View followers/following lists

- **Posts**
  - Create posts with images and captions
  - Like/unlike posts
  - Save/unsave posts
  - Delete posts
  - View user posts grid
  - Personalized feed
  - Explore page
  - Hashtag support
  - Double-tap to like
  - Post detail modal

- **Comments**
  - Add comments to posts
  - Delete comments (own or on own posts)
  - Paginated comments
  - Real-time comment updates

- **Stories**
  - Create 24-hour stories
  - View stories from followed users
  - Story viewer with progress bars
  - Auto-advance stories
  - Delete own stories
  - Track story views

- **UI/UX**
  - Responsive design (mobile & desktop)
  - Dark/light theme toggle
  - Collapsible sidebar
  - Skeleton loaders
  - Toast notifications
  - Smooth animations
  - Instagram-like interface

## Tech Stack

- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **State Management:** Redux Toolkit
- **Routing:** React Router DOM v7
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI + shadcn/ui
- **HTTP Client:** Axios
- **Icons:** Lucide React
- **Date Formatting:** date-fns
- **Form Handling:** React Dropzone

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Backend API running (see server README)

## Installation

1. **Navigate to client directory**
   ```bash
   cd client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the client directory:
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

The app will start on `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
client/
├── public/              # Static assets
├── src/
│   ├── api/            # API configuration (axios)
│   ├── components/     # React components
│   │   ├── ui/        # shadcn/ui components
│   │   └── skeletons/ # Loading skeletons
│   ├── contexts/      # React contexts
│   ├── hooks/         # Custom hooks
│   ├── lib/           # Utility functions
│   ├── pages/         # Page components
│   │   └── auth/      # Auth pages
│   ├── store/         # Redux store
│   │   └── slices/    # Redux slices
│   ├── types/         # TypeScript types
│   ├── App.tsx        # Main app component
│   ├── main.tsx       # Entry point
│   └── index.css      # Global styles
├── .env               # Environment variables
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## Key Components

### Pages
- **Home** - Feed with posts and stories
- **Explore** - Discover new posts
- **Search** - Search for users
- **Profile** - User profile with posts grid
- **Login/Register** - Authentication pages

### Features
- **PostCard** - Individual post display
- **StoriesCarousel** - Horizontal stories slider
- **StoryViewer** - Full-screen story viewer
- **CreatePost** - Post creation dialog
- **CreateStory** - Story creation dialog
- **CommentList** - Comments display
- **Sidebar** - Navigation sidebar
- **ThemeToggle** - Dark/light mode switch

## State Management

Redux Toolkit slices:
- `authSlice` - User authentication
- `postSlice` - Posts management
- `commentSlice` - Comments management
- `storySlice` - Stories management
- `userSlice` - User profiles
- `searchSlice` - User search
- `followSlice` - Follow/unfollow
- `notificationSlice` - Toast notifications

## Styling

- **Tailwind CSS** for utility-first styling
- **shadcn/ui** for pre-built components
- **CSS Variables** for theming
- **Responsive design** with mobile-first approach
- **Dark mode** support with theme toggle

## API Integration

The frontend communicates with the backend API using Axios. All API calls are centralized in Redux Toolkit async thunks.

**Base URL:** Configured via `VITE_API_URL` environment variable

**Authentication:** JWT token stored in localStorage and automatically included in requests

## Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized build in the `dist/` directory.

### Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts

Or connect your GitHub repository to Vercel for automatic deployments.

### Environment Variables

Set `VITE_API_URL` to your production API URL in your deployment platform.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

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

- Instagram for design inspiration
- shadcn/ui for component library
- Radix UI for accessible primitives
- Tailwind CSS for styling utilities
