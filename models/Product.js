const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: [2, 'Product name must be at least 2 characters'],
      maxlength: [100, 'Product name cannot exceed 100 characters'],
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      trim: true,
      uppercase: true,
      match: [/^[A-Z0-9][A-Z0-9-]*$/, 'SKU may only contain letters, numbers and hyphens'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      minlength: [2, 'Category must be at least 2 characters'],
      maxlength: [50, 'Category cannot exceed 50 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
      validate: {
        validator: (value) => Number.isFinite(value),
        message: 'Price must be a valid number',
      },
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
      validate: {
        validator: (value) => Number.isInteger(value),
        message: 'Quantity must be a whole number',
      },
    },
    reorderLevel: {
      type: Number,
      required: [true, 'Reorder level is required'],
      min: [0, 'Reorder level cannot be negative'],
      validate: {
        validator: (value) => Number.isInteger(value),
        message: 'Reorder level must be a whole number',
      },
    },
    supplier: {
      type: String,
      required: [true, 'Supplier is required'],
      trim: true,
      minlength: [2, 'Supplier name must be at least 2 characters'],
      maxlength: [100, 'Supplier name cannot exceed 100 characters'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.virtual('stockValue').get(function () {
  if (typeof this.price !== 'number' || typeof this.quantity !== 'number') {
    return 0;
  }

  return this.price * this.quantity;
});

productSchema.index({ category: 1 });
productSchema.index({ name: 1 });

module.exports = mongoose.model('Product', productSchema);
