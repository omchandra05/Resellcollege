const User = require('../models/user');
const Listing = require('../models/listing');
const mongoose = require('mongoose');

// Toggle item in wishlist (Add if not present, remove if present)
exports.toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!req.user) {
      return res.status(401).json({ 
        status: 'fail',
        message: 'Authentication required' 
      });
    }

    const userId = req.user._id || req.user.id;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ 
        status: 'fail',
        message: 'A valid Product ID is required' 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Initialize wishlist if it doesn't exist
    if (!user.wishlist) {
      user.wishlist = [];
    }

    const index = user.wishlist.findIndex(id => id && id.toString() === productId);
    let action;

    if (index === -1) {
      user.wishlist.push(productId);
      action = 'added';
    } else {
      user.wishlist.splice(index, 1);
      action = 'removed';
    }

    await user.save();

    res.status(200).json({
      status: 'success',
      message: `Item ${action} wishlist`,
      data: {
        wishlist: user.wishlist
      }
    });
  } catch (error) {
    console.error('Wishlist toggle error:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Server error updating wishlist',
      error: error.message 
    });
  }
};

// Get populated wishlist for the profile page
exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist');
    
    res.status(200).json({
      status: 'success',
      data: {
        wishlist: user ? user.wishlist : []
      }
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ message: 'Server error fetching wishlist' });
  }
};
