const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  productImage: { type: String, required: true },
  sku: { type: String, required: true },
  variant: {
    name: { type: String },
    value: { type: String }
  },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  shippedQuantity: { type: Number, default: 0 },
  returnedQuantity: { type: Number, default: 0 }
});

const shipmentSchema = new mongoose.Schema({
  shipmentId: { type: String, required: true },
  items: [orderItemSchema],
  trackingNumber: { type: String },
  courier: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'shipped', 'delivered', 'failed', 'returned'],
    default: 'pending'
  },
  shippedAt: { type: Date },
  deliveredAt: { type: Date },
  trackingUrl: { type: String },
  estimatedDelivery: { type: Date }
});

const addressSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
  isDefault: { type: Boolean, default: false }
});

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true, required: true },
  userId: { type: String, required: true },
  userEmail: { type: String, required: true },
  
  // Order details
  items: [orderItemSchema],
  subtotal: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  shippingCost: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  
  // Addresses
  billingAddress: addressSchema,
  shippingAddress: addressSchema,
  
  // Payment
  paymentMethod: { type: String, required: true },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  paymentId: { type: String },
  paymentDate: { type: Date },
  
  // Order status
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'pending'
  },
  
  // Shipping
  shipments: [shipmentSchema],
  allowPartialShipment: { type: Boolean, default: true },
  shippingMethod: { type: String, required: true },
  estimatedDelivery: { type: Date },
  
  // Returns
  returnRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ReturnRequest' }],
  isReturnable: { type: Boolean, default: true },
  
  // Notes
  customerNotes: { type: String },
  adminNotes: { type: String },
  
  // Timestamps
  orderDate: { type: Date, default: Date.now },
  confirmedAt: { type: Date },
  shippedAt: { type: Date },
  deliveredAt: { type: Date },
  cancelledAt: { type: Date },
  
  // Audit
  createdBy: { type: String },
  updatedBy: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Indexes
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ userId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ orderDate: -1 });
orderSchema.index({ paymentStatus: 1 });

// Pre-save middleware to generate order number
orderSchema.pre('save', function(next) {
  if (this.isNew && !this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.orderNumber = `EK${year}${month}${random}`;
  }
  this.updatedAt = new Date();
  next();
});

// Method to calculate totals
orderSchema.methods.calculateTotals = function() {
  this.subtotal = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
  this.total = this.subtotal + this.tax + this.shippingCost - this.discount;
  return this.total;
};

// Method to check if order can be partially shipped
orderSchema.methods.canPartialShip = function() {
  return this.allowPartialShipment && this.items.some(item => 
    item.quantity > item.shippedQuantity
  );
};

// Method to get shipped items count
orderSchema.methods.getShippedItemsCount = function() {
  return this.items.reduce((sum, item) => sum + item.shippedQuantity, 0);
};

// Method to get total items count
orderSchema.methods.getTotalItemsCount = function() {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
};

module.exports = mongoose.model('Order', orderSchema);