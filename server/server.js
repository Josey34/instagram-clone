import cors from 'cors';
import dotenv from 'dotenv';
import express from "express";
import path from 'path';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';

const app = express();
const port = process.env.PORT || 3000;
const __dirname = path.resolve();

dotenv.config();
app.use(cors());

//Simple middleware
// app.use((req, res, next) => {
//     console.log(`Request Method: ${req.method}, Request URL: ${req.url}`);
//     next();
// });

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use('/api/auth', authRoutes);

connectDB().then(() => {
    app.listen(port, () => {
        console.log(`Server is listening on port ${port}`)
    });
}).catch((error) => {
    console.log(`Error: ${error.message}`);
    process.exit(1);
});