import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// generate JWT token
const generateToken = (user) => {
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || "7d" });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
    try {
        console.log('Register Request Body:', req.body);
        const { username, email, password } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ $or: [{ email }] });

        if(userExists) {
            return res.status(400).json({
                success: false,
                error : 
                    userExists.email === email
                    ? 'Email is already registered'
                    : 'Username is already taken',
            });
        }

        // create new user
        const user = await User.create({    
            username,
            email,
            password,
        });

        // generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    profileImage: user.profileImage,
                    createdAt: user.createdAt,
                },
                token,
            },
            message: 'User registered successfully',
        });
    }
    catch (error) {
        next(error);
    }
};

// @desc    Login user and get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if(!email || !password) {
            return res.status(400).json({
                success: false,
                error : 'Please provide email and password',
            });
        }

        // Check if user exists
        const user = await User.findOne({ email }).select('+password');

        if(!user) {
            return res.status(400).json({
                success: false,
                error : 'Invalid email or password',
            });
        }

        // check password
        const isMatch = await user.matchPassword(password);

        if(!isMatch) {
            return res.status(400).json({
                success: false,
                error : 'Invalid email or password',
            });
        } 

        // generate token
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            user : {
                id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
            },
            token,
            message: 'Logged in successfully', 
        });
    }
    catch (error) {
        next(error);
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        res.status(200).json({
            success: true,
            data: { 
                id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        });
    }
    catch (error) {
        next(error);
    }
};

// @desc    Update user profile 
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
    console.log('Update Profile Request Body:', req.body);
    try {
        const { username, email, profileImage } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found',
            });
        }

        console.log(user);

        // Check if new username already exists (only if being changed)
        if(username)  user.username = username;
        

        // Check if new email already exists (only if being changed)
        // if(email && email !== user.email) {
        //     const existingUser = await User.findOne({ email });
        //     if(existingUser) {
        //         return res.status(400).json({
        //             success: false,
        //             error: 'Email is already registered',
        //         });
        //     }
        //     user.email = email;
        // }

        if(email) user.email = email;

        if(profileImage) user.profileImage = profileImage;
        
        // console.log('Before save - user data:', user);
        await user.save();

        res.status(200).json({
            success: true,
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
            },
            message: 'Profile updated successfully',
        });
    }
    catch (error) {
        console.error('Error updating profile:', error);
        
        // Handle MongoDB duplicate key error
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({
                success: false,
                error: `${field.charAt(0).toUpperCase() + field.slice(1)} is already taken`,
                statusCode: 400,
            });
        }
        
        next(error);
    }
};

// @desc    Change user password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if(!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                error : 'Please provide current and new password',
                statusCode: 400,
            });
        }

        const user = await User.findById(req.user._id).select('+password');

        // check current password
        const isMatch = await user.matchPassword(currentPassword);

        if(!isMatch) {
            return res.status(400).json({
                success: false,
                error : 'Current password is incorrect',
                statusCode: 400,
            });
        }

        // update password
        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully',
        });
    }
    catch (error) {
        next(error);
    }
};