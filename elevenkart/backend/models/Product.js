const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Color", "Size"
  value: { type: String, required: true }, // e.g., "Red", "XL"
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  sku: { type: String, unique: true },
  images: [{ type: String }]
});

const reviewSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  images: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  helpful: [{ type: String }] // Array of user IDs who found this helpful
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  shortDescription: { type: String, required: true },
  category: { 
    type: String, 
    required: true, 
    enum: ['Clothing', 'Kitchen Items', 'Kids Toys', 'Electronics'] 
  },
  subcategory: { type: String },
  brand: { type: String, required: true },
  price: { type: Number, required: true },
  comparePrice: { type: Number }, // Original price for discounts
  costPrice: { type: Number, required: true },
  sku: { type: String, unique: true, required: true },
  barcode: { type: String },
  
  // Images
  mainImage: { type: String, required: true },
  images: [{ type: String }],
  videos: [{ type: String }],
  
  // Variants
  hasVariants: { type: Boolean, default: false },
  variants: [variantSchema],
  
  // Inventory
  stock: { type: Number, default: 0 },
  lowStockThreshold: { type: Number, default: 5 },
  isInStock: { type: Boolean, default: true },
  
  // Product status
  isActive: { type: Boolean, default: true },
  isDraft: { type: Boolean, default: false },
  isReturnable: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  
  // SEO
  metaTitle: { type: String },
  metaDescription: { type: String },
  slug: { type: String, unique: true, required: true },
  
  // Specifications
  specifications: { type: Map, of: String },
  dimensions: {
    length: { type: Number },
    width: { type: Number },
    height: { type: Number },
    weight: { type: Number }
  },
  
  // Shipping
  shippingWeight: { type: Number },
  shippingClass: { type: String },
  freeShipping: { type: Boolean, default: false },
  
  // Reviews and ratings
  reviews: [reviewSchema],
  averageRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  
  // Related products
  relatedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  
  // Tags for search
  tags: [{ type: String }],
  
  // Audit fields
  createdBy: { type: String, required: true },
  updatedBy: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Indexes for better performance
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ slug: 1 });
productSchema.index({ sku: 1 });

// Pre-save middleware to update average rating
productSchema.pre('save', function(next) {
  if (this.reviews && this.reviews.length > 0) {
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.averageRating = totalRating / this.reviews.length;
    this.totalReviews = this.reviews.length;
  }
  this.updatedAt = new Date();
  next();
});

// Method to check if product is in stock
productSchema.methods.isAvailable = function() {
  if (this.hasVariants) {
    return this.variants.some(variant => variant.stock > 0);
  }
  return this.stock > 0;
};

// Method to get total stock
productSchema.methods.getTotalStock = function() {
  if (this.hasVariants) {
    return this.variants.reduce((total, variant) => total + variant.stock, 0);
  }
  return this.stock;
};

module.exports = mongoose.model('Product', productSchema);