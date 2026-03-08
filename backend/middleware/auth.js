import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import errorHandler from './errorHandler.js';

const protect = async (req, res, next) => {
    let token;

    // check for token in Authorization header

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1]; 

            // verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password'); // attach user to request, exclude password

            if(!req.user) {
                return res.status(401).json({
                    success: false,
                    error : 'User not found. Invalid token.',
                    statusCode: 401,
                });
            }

            next();
        }
        catch (error) {
            console.error('Auth Middleware Error:', error.message);

            if(error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    error : 'Your token has expired. Please log in again.',
                    statusCode: 401,
                });
            }

            return res.status(401).json({
                success: false,
                error : 'Not authorized. Invalid token.',
                statusCode: 401,
            });
        }
    }

    if(!token) {
        return res.status(401).json({
            success: false,
            error : 'Not authorized. No token provided.',
            statusCode: 401,
        });
    }
};

export default protect;