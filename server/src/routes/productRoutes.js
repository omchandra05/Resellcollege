const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.get('/', productController.getAllProducts);

router.route('/:id')
  .get(productController.getProductById)
  .patch(protect, restrictTo('seller'), productController.updateProduct)
  .delete(protect, restrictTo('seller'), productController.deleteProduct);

// Only sellers can create products
router.post('/', protect, restrictTo('seller'), productController.createProduct);

// Mark a product as sold
router.post('/:id/sell', protect, restrictTo('seller'), productController.markProductAsSold);

module.exports = router;