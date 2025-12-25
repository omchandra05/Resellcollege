const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        unique: true,
        sparse: true,
    },
    email: {
        type : String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6, 
        select: false
    },
    gender: {
        type: String,
        enum: ["male","female","other"],
    },
    avatar: {
        type: String,
        default: null,
    },
    bio: {
        type: String,
        default: null,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    role : {
        type: String,
        enum: ["buyer", "seller", "admin"],
        default: "buyer",
    },
    settings:{
        theme: {
            type: String,
            enum: ["light", "dark"],
            default: "light",
        }
    },
    wishlist: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Listing'
        }
    ],
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});


userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};


const User = mongoose.model('User', userSchema);
module.exports = User;