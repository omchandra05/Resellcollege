const mongoose = require ('mongoose');


const listingSchema = new mongoose.Schema({
    listingId: {
        type: String,
        required: true,
        unique: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "Mobiles",
        "Laptops",
        "Electronics",
        "Furniture",
        "Books",
        "Vehicles",
        "Fashion",
        "Sports",
        "Other",
      ],
    },

    condition: {
      type: String,
      enum: ["Brand New", "Like New", "Good", "Fair", "Used"],
      default: "Good",
    },

    images: [
      {
        type: String,
        required: true,
      },
    ],

    priceNegotiable: {
      type: Boolean,
      default: false,
    },

    location: {
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String },
      address: { type: String },
      latitude: Number,
      longitude: Number,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["available", "sold"],
      default: "available",
    },

    views: {
      type: Number,
      default: 0,
    },

    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },

  { timestamps: true }
);