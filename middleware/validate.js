const ApiError = require('../utils/ApiError');

const SORT_FIELDS = [
  'name',
  'sku',
  'category',
  'price',
  'quantity',
  'reorderLevel',
  'createdAt',
  'updatedAt',
];

const OBJECT_ID_PATTERN = /^[0-9a-fA-F]{24}$/;

const isBlank = (value) =>
  value === undefined || value === null || (typeof value === 'string' && value.trim() === '');

const toNumber = (value) => {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    return Number(value);
  }

  return Number.NaN;
};

const validateNumber = (value, field, options = {}) => {
  const { integer = false, min = 0 } = options;

  if (isBlank(value)) {
    return `${field} is required`;
  }

  const number = toNumber(value);

  if (!Number.isFinite(number)) {
    return `${field} must be a valid number`;
  }

  if (number < min) {
    return `${field} cannot be less than ${min}`;
  }

  if (integer && !Number.isInteger(number)) {
    return `${field} must be a whole number`;
  }

  return null;
};

const validateCreateProduct = (req, res, next) => {
  const body = req.body || {};
  const errors = [];

  ['name', 'sku', 'category', 'supplier'].forEach((field) => {
    if (typeof body[field] !== 'string' || body[field].trim() === '') {
      errors.push(`${field} is required`);
    }
  });

  const priceError = validateNumber(body.price, 'price');
  if (priceError) {
    errors.push(priceError);
  }

  const quantityError = validateNumber(body.quantity, 'quantity', { integer: true });
  if (quantityError) {
    errors.push(quantityError);
  }

  const reorderLevelError = validateNumber(body.reorderLevel, 'reorderLevel', { integer: true });
  if (reorderLevelError) {
    errors.push(reorderLevelError);
  }

  if (errors.length > 0) {
    return next(new ApiError(400, 'Validation failed', errors));
  }

  return next();
};

const validateUpdateProduct = (req, res, next) => {
  const body = req.body || {};
  const allowedFields = ['name', 'sku', 'category', 'price', 'quantity', 'reorderLevel', 'supplier'];
  const providedFields = allowedFields.filter((field) => body[field] !== undefined);
  const errors = [];

  if (providedFields.length === 0) {
    return next(
      new ApiError(400, 'At least one product field is required to update', [
        `Allowed fields: ${allowedFields.join(', ')}`,
      ])
    );
  }

  ['name', 'sku', 'category', 'supplier'].forEach((field) => {
    if (body[field] !== undefined && (typeof body[field] !== 'string' || body[field].trim() === '')) {
      errors.push(`${field} cannot be empty`);
    }
  });

  if (body.price !== undefined) {
    const priceError = validateNumber(body.price, 'price');
    if (priceError) {
      errors.push(priceError);
    }
  }

  if (body.quantity !== undefined) {
    const quantityError = validateNumber(body.quantity, 'quantity', { integer: true });
    if (quantityError) {
      errors.push(quantityError);
    }
  }

  if (body.reorderLevel !== undefined) {
    const reorderLevelError = validateNumber(body.reorderLevel, 'reorderLevel', { integer: true });
    if (reorderLevelError) {
      errors.push(reorderLevelError);
    }
  }

  if (errors.length > 0) {
    return next(new ApiError(400, 'Validation failed', errors));
  }

  return next();
};

const validateStockChange = (req, res, next) => {
  const body = req.body || {};

  if (isBlank(body.change)) {
    return next(new ApiError(400, 'change is required', ['Send a JSON body like { "change": 10 }']));
  }

  const change = toNumber(body.change);

  if (!Number.isFinite(change) || !Number.isInteger(change)) {
    return next(new ApiError(400, 'change must be a whole number'));
  }

  if (change === 0) {
    return next(new ApiError(400, 'change cannot be zero'));
  }

  return next();
};

const validateObjectId = (req, res, next) => {
  if (!OBJECT_ID_PATTERN.test(req.params.id)) {
    return next(new ApiError(400, 'Invalid product ID'));
  }

  return next();
};

const validateProductQuery = (req, res, next) => {
  const { category, search, sort, order, page, limit } = req.query;
  const errors = [];

  const options = {
    category: '',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'asc',
    page: 1,
    limit: 10,
  };

  if (category !== undefined) {
    if (typeof category !== 'string' || category.trim() === '') {
      errors.push('category cannot be empty');
    } else {
      options.category = category.trim();
    }
  }

  if (search !== undefined) {
    if (typeof search !== 'string' || search.trim() === '') {
      errors.push('search cannot be empty');
    } else {
      options.search = search.trim();
    }
  }

  if (sort !== undefined) {
    const normalizedSort = typeof sort === 'string' ? sort.trim().toLowerCase() : '';

    if (!SORT_FIELDS.includes(normalizedSort)) {
      errors.push(`sort must be one of: ${SORT_FIELDS.join(', ')}`);
    } else {
      options.sortBy = normalizedSort;
    }
  }

  if (order !== undefined) {
    const normalizedOrder = typeof order === 'string' ? order.trim().toLowerCase() : '';

    if (!['asc', 'desc'].includes(normalizedOrder)) {
      errors.push("order must be either 'asc' or 'desc'");
    } else {
      options.sortOrder = normalizedOrder;
    }
  }

  if (page !== undefined) {
    if (!/^\d+$/.test(String(page)) || Number(page) < 1) {
      errors.push('page must be a positive integer');
    } else {
      options.page = Number(page);
    }
  }

  if (limit !== undefined) {
    if (!/^\d+$/.test(String(limit)) || Number(limit) < 1 || Number(limit) > 100) {
      errors.push('limit must be a whole number between 1 and 100');
    } else {
      options.limit = Number(limit);
    }
  }

  if (errors.length > 0) {
    return next(new ApiError(400, 'Invalid query parameters', errors));
  }

  req.queryOptions = options;
  return next();
};

module.exports = {
  validateCreateProduct,
  validateUpdateProduct,
  validateStockChange,
  validateObjectId,
  validateProductQuery,
};
