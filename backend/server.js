import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import  errorHandler from './middleware/errorHandler.js';

// ES6 module syntax requires this to get the __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// intialize express app
const app = express();

// connect to database
connectDB();

// middleware to handle cors
app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    })
)

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//static folder for uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// routes


app.use(errorHandler);

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({ 
        success: false,
        message: 'Route not found',
        stausCode: 404
     });
});

// start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    process.exit(1);
});