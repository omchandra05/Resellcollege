const Listing = require('../models/listing');
const mongoose = require('mongoose');

exports.getAllProducts = async (req, res) => {
  try {
    const { search, category, condition, sort, price } = req.query;
    let query = { isDeleted: false, status: 'available' };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) {
      query.category = category;
    }

    if (condition) {
      query.condition = condition;
    }

    if (price) {
      query.price = {};
      if (price.gte) query.price.$gte = Number(price.gte);
      if (price.lte) query.price.$lte = Number(price.lte);
    }

    let sortOption = { createdAt: -1 }; // default sort
    if (sort === 'price-asc') sortOption = { price: 1 };
    if (sort === 'price-desc') sortOption = { price: -1 };

    const products = await Listing.find(query)
      .populate('owner', 'name avatar isVerified')
      .sort(sortOption);
    
    res.status(200).json({
      status: 'success',
      results: products.length,
      data: { products }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ status: 'fail', message: 'Invalid Product ID' });
    }

    const product = await Listing.findOne({ _id: req.params.id, isDeleted: false }).populate('owner', 'name avatar isVerified');
    
    if (!product) {
      return res.status(404).json({ status: 'fail', message: 'Product not found' });
    }

    res.status(200).json({
      status: 'success',
      data: { product }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { title, description, price, category, condition, images, location, city, state, coordinates } = req.body;

    // Support both nested location object or flat city/state fields from frontend
    const finalLocation = {
      city: city || location?.city,
      state: state || location?.state,
      pincode: req.body.pincode || location?.pincode,
      address: req.body.address || location?.address,
      coordinates: coordinates || location?.coordinates // Save lat/lng
    };

    if (!title || !description || !price || !category || !finalLocation.city || !finalLocation.state || !images) {
      return res.status(400).json({ 
        status: 'fail', 
        message: 'Missing required fields. Ensure title, description, price, category, city, state, and images are provided.' 
      });
    }

    // Generate a unique listingId as required by the model
    const listingId = `LST-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    const newProduct = await Listing.create({
      ...req.body,
      location: finalLocation,
      listingId,
      owner: req.user._id || req.user.id
    });

    res.status(201).json({
      status: 'success',
      data: { product: newProduct }
    });
  } catch (error) {
    console.error('Product Creation Error:', error);
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

/**
 * @desc    Mark a product as sold
 * @route   POST /api/products/:id/sell
 * @access  Private (only the product owner)
 */
exports.markProductAsSold = async (req, res) => {
  try {
    const product = await Listing.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Ensure the user making the request is the owner of the product
    if (product.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'User not authorized to perform this action' });
    }

    product.status = 'sold';
    await product.save();

    res.status(200).json({ success: true, message: 'Product marked as sold successfully' });
  } catch (error) {
    console.error('Error in markProductAsSold:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ status: 'fail', message: 'Invalid Product ID' });
    }

    let product = await Listing.findOne({ _id: req.params.id, isDeleted: false });
    
    if (!product) {
      return res.status(404).json({ status: 'fail', message: 'Product not found' });
    }

    // Robust ownership check: handle both ObjectId and populated objects
    const ownerId = product.owner._id ? product.owner._id.toString() : product.owner.toString();
    if (ownerId !== req.user._id.toString()) {
      return res.status(403).json({ status: 'fail', message: 'You do not have permission to update this listing' });
    }

    const { city, state, location, coordinates } = req.body;
    if (city || state || location || coordinates) {
      req.body.location = {
        city: city || location?.city || product.location?.city,
        state: state || location?.state || product.location?.state,
        pincode: req.body.pincode || location?.pincode || product.location?.pincode,
        address: req.body.address || location?.address || product.location?.address,
        coordinates: coordinates || location?.coordinates || product.location?.coordinates
      };
    }

    const updatedProduct = await Listing.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ status: 'success', data: { product: updatedProduct } });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ status: 'fail', message: 'Invalid Product ID' });
    }

    const product = await Listing.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ status: 'fail', message: 'Product not found' });
    }

    // Robust ownership check
    const ownerId = product.owner._id ? product.owner._id.toString() : product.owner.toString();
    if (ownerId !== req.user._id.toString()) {
      return res.status(403).json({ status: 'fail', message: 'You do not have permission to delete this listing' });
    }

    product.isDeleted = true;
    await product.save();

    res.status(204).json({ status: 'success', data: null });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};