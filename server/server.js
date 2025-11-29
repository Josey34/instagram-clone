import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

import cors from 'cors';
import express from "express";
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import commentRoutes from './routes/comment.js';
import postRoutes from './routes/post.js';
import storyRoute from './routes/story.js';
import uploadRoutes from './routes/upload.js';
import userRoutes from './routes/user.js';

const app = express();
const port = process.env.PORT || 3000;

// Trust proxy - required for rate limiting behind reverse proxies (Railway, Render, etc.)
app.set('trust proxy', 1);

app.use(cors());

app.use(helmet());

app.use(morgan('dev'));

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/stories', storyRoute);
app.use('/api/upload', uploadRoutes);

app.use(errorHandler);

connectDB().then(() => {
    app.listen(port, () => {
        console.log(`Server is listening on port ${port}`)
    });
}).catch((error) => {
    console.log(`Error: ${error.message}`);
    process.exit(1);
});