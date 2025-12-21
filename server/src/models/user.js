const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
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
    role : {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    settings:{
        theme: {
            type: String,
            enum: ["light", "dark"],
            default: "light",
        }
    },
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