const mongoose = require('mongoose');

const returnItemSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  sku: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  reason: { 
    type: String, 
    required: true,
    enum: [
      'defective', 
      'wrong_item', 
      'size_issue', 
      'quality_issue', 
      'not_as_described', 
      'damaged', 
      'other'
    ]
  },
  description: { type: String, required: true },
  images: [{ type: String }],
  unboxingVideo: { type: String }, // Cloudinary URL
  condition: { 
    type: String, 
    enum: ['new', 'like_new', 'good', 'fair', 'poor'],
    required: true
  }
});

const returnRequestSchema = new mongoose.Schema({
  returnNumber: { type: String, unique: true, required: true },
  userId: { type: String, required: true },
  userEmail: { type: String, required: true },
  
  // Return details
  items: [returnItemSchema],
  totalItems: { type: Number, required: true },
  
  // Status
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'processing', 'completed', 'cancelled'],
    default: 'pending'
  },
  
  // Return type
  returnType: { 
    type: String, 
    enum: ['refund', 'exchange', 'store_credit'],
    required: true
  },
  
  // Exchange details (if applicable)
  exchangeProductId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  exchangeVariant: {
    name: { type: String },
    value: { type: String }
  },
  
  // Refund details
  refundAmount: { type: Number },
  refundMethod: { type: String },
  refundStatus: { 
    type: String, 
    enum: ['pending', 'processed', 'completed', 'failed'],
    default: 'pending'
  },
  
  // Shipping
  returnLabel: {
    trackingNumber: { type: String },
    courier: { type: String },
    labelUrl: { type: String },
    pickupScheduled: { type: Date },
    pickedUpAt: { type: Date },
    deliveredAt: { type: Date }
  },
  
  // Admin processing
  adminNotes: { type: String },
  adminId: { type: String },
  processedAt: { type: Date },
  
  // Customer details
  customerNotes: { type: String },
  contactPhone: { type: String },
  
  // Timestamps
  requestedAt: { type: Date, default: Date.now },
  approvedAt: { type: Date },
  rejectedAt: { type: Date },
  completedAt: { type: Date },
  
  // Audit
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Indexes
returnRequestSchema.index({ returnNumber: 1 });
returnRequestSchema.index({ userId: 1 });
returnRequestSchema.index({ status: 1 });
returnRequestSchema.index({ requestedAt: -1 });

// Pre-save middleware to generate return number
returnRequestSchema.pre('save', function(next) {
  if (this.isNew && !this.returnNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.returnNumber = `RET${year}${month}${random}`;
  }
  
  // Calculate total items
  if (this.items && this.items.length > 0) {
    this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
  }
  
  this.updatedAt = new Date();
  next();
});

// Method to check if return can be approved
returnRequestSchema.methods.canApprove = function() {
  return this.status === 'pending' && this.items.every(item => 
    item.unboxingVideo || item.images.length > 0
  );
};

// Method to calculate refund amount
returnRequestSchema.methods.calculateRefundAmount = function() {
  // This would typically calculate based on original order prices
  // For now, return a placeholder
  return this.items.reduce((sum, item) => sum + (item.price || 0), 0);
};

// Method to get return summary
returnRequestSchema.methods.getSummary = function() {
  return {
    returnNumber: this.returnNumber,
    status: this.status,
    totalItems: this.totalItems,
    returnType: this.returnType,
    requestedAt: this.requestedAt
  };
};

module.exports = mongoose.model('ReturnRequest', returnRequestSchema);