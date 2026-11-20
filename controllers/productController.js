const Product = require('../models/Product');
const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/ApiError');

const PRODUCT_FIELDS = ['name', 'sku', 'category', 'price', 'quantity', 'reorderLevel', 'supplier'];

const pickProductFields = (body) =>
  PRODUCT_FIELDS.reduce((data, field) => {
    if (body[field] !== undefined) {
      data[field] = body[field];
    }

    return data;
  }, {});

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(pickProductFields(req.body));
  res.status(201).json(product);
});

const getProducts = asyncHandler(async (req, res) => {
  const { category, search, sortBy, sortOrder, page, limit } = req.queryOptions;
  const filter = {};

  if (category) {
    filter.category = new RegExp(`^${escapeRegex(category)}$`, 'i');
  }

  if (search) {
    const searchPattern = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ name: searchPattern }, { sku: searchPattern }];
  }

  const sort = {
    [sortBy]: sortOrder === 'asc' ? 1 : -1,
    _id: 1,
  };

  const skip = (page - 1) * limit;

  const [total, products] = await Promise.all([
    Product.countDocuments(filter),
    Product.find(filter).sort(sort).skip(skip).limit(limit),
  ]);

  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

  res.json({
    total,
    page,
    totalPages,
    count: products.length,
    products,
  });
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  res.json(product);
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  Object.assign(product, pickProductFields(req.body));
  const updatedProduct = await product.save();

  res.json(updatedProduct);
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  res.json({
    message: 'Product deleted',
    id: product._id,
  });
});

const getLowStockProducts = asyncHandler(async (req, res) => {
  const lowStockItems = await Product.find({
    $expr: { $lte: ['$quantity', '$reorderLevel'] },
  }).sort({ createdAt: 1, _id: 1 });

  res.json({
    count: lowStockItems.length,
    lowStockItems,
  });
});

const getCategorySummary = asyncHandler(async (req, res) => {
  const summary = await Product.aggregate([
    {
      $group: {
        _id: '$category',
        totalItems: { $sum: 1 },
        totalQuantity: { $sum: '$quantity' },
        totalStockValue: { $sum: { $multiply: ['$price', '$quantity'] } },
        avgPrice: { $avg: '$price' },
      },
    },
    { $sort: { totalStockValue: -1, _id: 1 } },
    {
      $project: {
        _id: 1,
        totalItems: 1,
        totalQuantity: 1,
        totalStockValue: 1,
        avgPrice: { $round: ['$avgPrice', 2] },
      },
    },
  ]);

  res.json({
    categories: summary.length,
    summary,
  });
});

const adjustStock = asyncHandler(async (req, res) => {
  const change = Number(req.body.change);
  const filter = { _id: req.params.id };

  if (change < 0) {
    filter.quantity = { $gte: Math.abs(change) };
  }

  const product = await Product.findOneAndUpdate(
    filter,
    { $inc: { quantity: change } },
    { new: true, runValidators: true }
  );

  if (!product) {
    const existingProduct = await Product.findById(req.params.id).select('quantity');

    if (!existingProduct) {
      throw new ApiError(404, 'Product not found');
    }

    throw new ApiError(
      400,
      `Insufficient stock. Available quantity is ${existingProduct.quantity}, cannot apply a change of ${change}.`
    );
  }

  res.json({
    message: 'Stock updated',
    product,
  });
});

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
  getCategorySummary,
  adjustStock,
};
