import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minLength: [3, 'Username must be at least 3 characters long'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        match : [/\S+@\S+\.\S+/, 'Please use a valid email address'],
    },
    password: {
        type: String,  
        required: [true, 'Password is required'],
        minLength: [6, 'Password must be at least 6 characters long'],
        select : false, // Exclude password from query results by default
    },
    profileImage: {
        type: String,
        default : null,
    },
}, {
    timestamps: true,
});

// Hash the password before saving the user
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        console.log('Password not modified, skipping hash');
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User; 