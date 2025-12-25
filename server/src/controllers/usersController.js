const User = require('../models/user');

// Update user profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, bio, gender, isVerified } = req.body;
    const userId = req.user.id;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (gender !== undefined) updateData.gender = gender;

    // Only allow updating isVerified if it's explicitly sent as true.
    // This prevents a user from un-verifying themselves.
    if (isVerified === true) {
      updateData.isVerified = true;
    }

    // Find and update user
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { 
        new: true, // Return updated document
        runValidators: true 
      }
    );

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          bio: user.bio,
          gender: user.gender,
          isVerified: user.isVerified,
          createdAt: user.createdAt
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get user profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          bio: user.bio,
          gender: user.gender,
          isVerified: user.isVerified,
          createdAt: user.createdAt
        }
      }
    });
  } catch (err) {
    next(err);
  }
};
