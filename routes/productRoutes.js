const express = require('express');

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
  getCategorySummary,
  adjustStock,
} = require('../controllers/productController');

const {
  validateCreateProduct,
  validateUpdateProduct,
  validateStockChange,
  validateObjectId,
  validateProductQuery,
} = require('../middleware/validate');

const router = express.Router();

router
  .route('/')
  .get(validateProductQuery, getProducts)
  .post(validateCreateProduct, createProduct);

router.get('/low-stock', getLowStockProducts);
router.get('/summary', getCategorySummary);

router
  .route('/:id')
  .get(validateObjectId, getProductById)
  .put(validateObjectId, validateUpdateProduct, updateProduct)
  .delete(validateObjectId, deleteProduct);

router.patch('/:id/stock', validateObjectId, validateStockChange, adjustStock);

module.exports = router;
