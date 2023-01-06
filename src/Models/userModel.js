const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    title: {
        type: String,
        required: "Title is Mandatory",
        enum: ["Mr", "Mrs", "Miss"],
        trim: true
    },
    name: {
        type: String,
        required: "Name is Mandatory",
        trim: true
    },
    phone: {
        type: String,
        required: "Phone Number is Mandatory",
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: "Email address is Mandatory",
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: "Password is Mandatory",
        trim: true
    },
    address: {
        street: {
            type: String,
            trim: true
        },
        city: {
            type: String,
            trim: true
        },
        pincode: {
            type: String,
            trim: true
        }
    }
}, { timestamps: true })

module.exports = mongoose.model('User', UserSchema)