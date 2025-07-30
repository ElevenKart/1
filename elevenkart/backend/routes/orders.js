const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { authMiddleware } = require('../middleware/auth');
const { generateInvoicePDF } = require('../utils/pdfGenerator');
const { calculateShippingCost } = require('../utils/shipping');

// Get user orders
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = { userId: req.params.userId };

    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .sort({ orderDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get order by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.productId', 'name mainImage price');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get order by order number
router.get('/number/:orderNumber', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber })
      .populate('items.productId', 'name mainImage price');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new order
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      items,
      billingAddress,
      shippingAddress,
      paymentMethod,
      customerNotes,
      allowPartialShipment = true
    } = req.body;

    // Validate items and check stock
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({ error: `Product ${item.productId} not found` });
      }

      if (!product.isAvailable()) {
        return res.status(400).json({ error: `Product ${product.name} is out of stock` });
      }

      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: product._id,
        productName: product.name,
        productImage: product.mainImage,
        sku: product.sku,
        variant: item.variant,
        quantity: item.quantity,
        price: item.price,
        totalPrice: itemTotal
      });
    }

    // Calculate shipping cost
    const shippingCost = await calculateShippingCost(shippingAddress, orderItems);

    // Calculate tax (simplified - you'd implement proper tax calculation)
    const tax = subtotal * 0.1; // 10% tax

    const total = subtotal + tax + shippingCost;

    const order = new Order({
      userId: req.user.id,
      userEmail: req.user.email,
      items: orderItems,
      subtotal,
      tax,
      shippingCost,
      total,
      billingAddress,
      shippingAddress,
      paymentMethod,
      customerNotes,
      allowPartialShipment,
      shippingMethod: 'standard',
      createdBy: req.user.id
    });

    await order.save();

    // Update product stock
    for (const item of orderItems) {
      const product = await Product.findById(item.productId);
      if (product.hasVariants && item.variant) {
        const variant = product.variants.find(v => 
          v.name === item.variant.name && v.value === item.variant.value
        );
        if (variant) {
          variant.stock -= item.quantity;
        }
      } else {
        product.stock -= item.quantity;
      }
      await product.save();
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update order status (Admin only)
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.status = status;
    order.adminNotes = adminNotes;
    order.updatedBy = req.user.id;

    // Set timestamps based on status
    switch (status) {
      case 'confirmed':
        order.confirmedAt = new Date();
        break;
      case 'shipped':
        order.shippedAt = new Date();
        break;
      case 'delivered':
        order.deliveredAt = new Date();
        break;
      case 'cancelled':
        order.cancelledAt = new Date();
        break;
    }

    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create partial shipment
router.post('/:id/shipments', authMiddleware, async (req, res) => {
  try {
    const { items, courier, trackingNumber } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (!order.canPartialShip()) {
      return res.status(400).json({ error: 'Order cannot be partially shipped' });
    }

    const shipmentId = `SHIP${Date.now()}`;
    const shipment = {
      shipmentId,
      items: items.map(item => ({
        ...item,
        shippedQuantity: item.quantity
      })),
      courier,
      trackingNumber,
      status: 'shipped',
      shippedAt: new Date()
    };

    order.shipments.push(shipment);

    // Update shipped quantities in order items
    for (const shipmentItem of shipment.items) {
      const orderItem = order.items.find(item => item.productId.toString() === shipmentItem.productId);
      if (orderItem) {
        orderItem.shippedQuantity += shipmentItem.shippedQuantity;
      }
    }

    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update shipment tracking
router.put('/:id/shipments/:shipmentId', authMiddleware, async (req, res) => {
  try {
    const { status, trackingUrl, estimatedDelivery } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const shipment = order.shipments.find(s => s.shipmentId === req.params.shipmentId);
    if (!shipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    shipment.status = status;
    if (trackingUrl) shipment.trackingUrl = trackingUrl;
    if (estimatedDelivery) shipment.estimatedDelivery = estimatedDelivery;

    if (status === 'delivered') {
      shipment.deliveredAt = new Date();
    }

    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate invoice PDF
router.get('/:id/invoice', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.productId', 'name sku');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const pdfBuffer = await generateInvoicePDF(order);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.orderNumber}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel order
router.post('/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status !== 'pending' && order.status !== 'confirmed') {
      return res.status(400).json({ error: 'Order cannot be cancelled' });
    }

    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.adminNotes = `Cancelled: ${reason}`;
    await order.save();

    // Restore product stock
    for (const item of order.items) {
      const product = await Product.findById(item.productId);
      if (product.hasVariants && item.variant) {
        const variant = product.variants.find(v => 
          v.name === item.variant.name && v.value === item.variant.value
        );
        if (variant) {
          variant.stock += item.quantity;
        }
      } else {
        product.stock += item.quantity;
      }
      await product.save();
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all orders (Admin only)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, dateFrom, dateTo } = req.query;
    const query = {};

    if (status) query.status = status;
    if (dateFrom || dateTo) {
      query.orderDate = {};
      if (dateFrom) query.orderDate.$gte = new Date(dateFrom);
      if (dateTo) query.orderDate.$lte = new Date(dateTo);
    }

    const orders = await Order.find(query)
      .sort({ orderDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('items.productId', 'name mainImage');

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;