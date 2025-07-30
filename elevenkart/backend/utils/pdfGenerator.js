const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Generate invoice PDF
const generateInvoicePDF = async (order) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Add company header
      addCompanyHeader(doc);
      
      // Add invoice details
      addInvoiceDetails(doc, order);
      
      // Add customer information
      addCustomerInfo(doc, order);
      
      // Add order items
      addOrderItems(doc, order);
      
      // Add totals
      addTotals(doc, order);
      
      // Add footer
      addFooter(doc);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

// Add company header
const addCompanyHeader = (doc) => {
  doc
    .fontSize(24)
    .font('Helvetica-Bold')
    .fillColor('#007BFF')
    .text('ElevenKart', { align: 'left' })
    .fontSize(12)
    .font('Helvetica')
    .fillColor('#666')
    .text('Your Premium Shopping Destination', { align: 'left' })
    .moveDown(0.5)
    .text('123 Commerce Street', { align: 'left' })
    .text('New York, NY 10001', { align: 'left' })
    .text('Phone: +1 (555) 123-4567', { align: 'left' })
    .text('Email: support@elevenkart.com', { align: 'left' })
    .moveDown(2);
};

// Add invoice details
const addInvoiceDetails = (doc, order) => {
  const currentDate = new Date().toLocaleDateString();
  
  doc
    .fontSize(18)
    .font('Helvetica-Bold')
    .fillColor('#333')
    .text('INVOICE', { align: 'right' })
    .fontSize(12)
    .font('Helvetica')
    .fillColor('#666')
    .text(`Invoice Number: ${order.orderNumber}`, { align: 'right' })
    .text(`Date: ${currentDate}`, { align: 'right' })
    .text(`Order Date: ${new Date(order.orderDate).toLocaleDateString()}`, { align: 'right' })
    .moveDown(2);
};

// Add customer information
const addCustomerInfo = (doc, order) => {
  doc
    .fontSize(14)
    .font('Helvetica-Bold')
    .fillColor('#333')
    .text('Bill To:', { align: 'left' })
    .fontSize(12)
    .font('Helvetica')
    .fillColor('#666')
    .text(`${order.billingAddress.firstName} ${order.billingAddress.lastName}`, { align: 'left' })
    .text(order.billingAddress.address, { align: 'left' })
    .text(`${order.billingAddress.city}, ${order.billingAddress.state} ${order.billingAddress.postalCode}`, { align: 'left' })
    .text(order.billingAddress.country, { align: 'left' })
    .text(`Email: ${order.billingAddress.email}`, { align: 'left' })
    .text(`Phone: ${order.billingAddress.phone}`, { align: 'left' })
    .moveDown(2);

  doc
    .fontSize(14)
    .font('Helvetica-Bold')
    .fillColor('#333')
    .text('Ship To:', { align: 'left' })
    .fontSize(12)
    .font('Helvetica')
    .fillColor('#666')
    .text(`${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`, { align: 'left' })
    .text(order.shippingAddress.address, { align: 'left' })
    .text(`${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}`, { align: 'left' })
    .text(order.shippingAddress.country, { align: 'left' })
    .moveDown(2);
};

// Add order items table
const addOrderItems = (doc, order) => {
  const tableTop = doc.y;
  const itemCodeX = 50;
  const descriptionX = 150;
  const quantityX = 350;
  const priceX = 400;
  const totalX = 500;

  // Table header
  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .fillColor('#333')
    .text('Item', itemCodeX, tableTop)
    .text('Description', descriptionX, tableTop)
    .text('Qty', quantityX, tableTop)
    .text('Price', priceX, tableTop)
    .text('Total', totalX, tableTop);

  // Draw header line
  doc
    .moveTo(50, tableTop + 20)
    .lineTo(550, tableTop + 20)
    .stroke();

  let yPosition = tableTop + 30;

  // Add items
  order.items.forEach((item, index) => {
    if (yPosition > 700) {
      doc.addPage();
      yPosition = 50;
    }

    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#333')
      .text(item.sku, itemCodeX, yPosition)
      .text(item.productName, descriptionX, yPosition, { width: 180 })
      .text(item.quantity.toString(), quantityX, yPosition)
      .text(`$${item.price.toFixed(2)}`, priceX, yPosition)
      .text(`$${item.totalPrice.toFixed(2)}`, totalX, yPosition);

    yPosition += 20;
  });

  // Draw bottom line
  doc
    .moveTo(50, yPosition)
    .lineTo(550, yPosition)
    .stroke();

  doc.y = yPosition + 20;
};

// Add totals
const addTotals = (doc, order) => {
  const totalsX = 400;
  let yPosition = doc.y;

  doc
    .fontSize(12)
    .font('Helvetica')
    .fillColor('#666')
    .text('Subtotal:', totalsX, yPosition)
    .text(`$${order.subtotal.toFixed(2)}`, 500, yPosition)
    .moveDown(0.5);

  yPosition += 20;
  doc
    .text('Tax:', totalsX, yPosition)
    .text(`$${order.tax.toFixed(2)}`, 500, yPosition)
    .moveDown(0.5);

  yPosition += 20;
  doc
    .text('Shipping:', totalsX, yPosition)
    .text(`$${order.shippingCost.toFixed(2)}`, 500, yPosition)
    .moveDown(0.5);

  if (order.discount > 0) {
    yPosition += 20;
    doc
      .text('Discount:', totalsX, yPosition)
      .text(`-$${order.discount.toFixed(2)}`, 500, yPosition)
      .moveDown(0.5);
  }

  // Total line
  yPosition += 20;
  doc
    .moveTo(totalsX - 10, yPosition)
    .lineTo(550, yPosition)
    .stroke();

  yPosition += 10;
  doc
    .fontSize(14)
    .font('Helvetica-Bold')
    .fillColor('#333')
    .text('Total:', totalsX, yPosition)
    .text(`$${order.total.toFixed(2)}`, 500, yPosition);

  doc.y = yPosition + 30;
};

// Add footer
const addFooter = (doc) => {
  const footerY = doc.page.height - 100;

  doc
    .fontSize(10)
    .font('Helvetica')
    .fillColor('#666')
    .text('Thank you for your business!', { align: 'center' })
    .moveDown(0.5)
    .text('For any questions, please contact us at support@elevenkart.com', { align: 'center' })
    .moveDown(0.5)
    .text('ElevenKart - Your Premium Shopping Destination', { align: 'center' });
};

// Generate return label PDF
const generateReturnLabelPDF = async (returnRequest) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Add return label content
      addReturnLabelHeader(doc, returnRequest);
      addReturnLabelDetails(doc, returnRequest);
      addReturnLabelItems(doc, returnRequest);
      addReturnLabelInstructions(doc);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

// Add return label header
const addReturnLabelHeader = (doc, returnRequest) => {
  doc
    .fontSize(20)
    .font('Helvetica-Bold')
    .fillColor('#007BFF')
    .text('RETURN LABEL', { align: 'center' })
    .moveDown(1)
    .fontSize(14)
    .font('Helvetica-Bold')
    .fillColor('#333')
    .text(`Return Number: ${returnRequest.returnNumber}`, { align: 'center' })
    .moveDown(2);
};

// Add return label details
const addReturnLabelDetails = (doc, returnRequest) => {
  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .fillColor('#333')
    .text('Return Details:', { align: 'left' })
    .fontSize(10)
    .font('Helvetica')
    .fillColor('#666')
    .text(`Customer: ${returnRequest.userEmail}`, { align: 'left' })
    .text(`Requested: ${new Date(returnRequest.requestedAt).toLocaleDateString()}`, { align: 'left' })
    .text(`Return Type: ${returnRequest.returnType}`, { align: 'left' })
    .moveDown(2);
};

// Add return label items
const addReturnLabelItems = (doc, returnRequest) => {
  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .fillColor('#333')
    .text('Items to Return:', { align: 'left' })
    .moveDown(0.5);

  returnRequest.items.forEach((item, index) => {
    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#666')
      .text(`${index + 1}. ${item.productName} (Qty: ${item.quantity})`, { align: 'left' })
      .text(`   SKU: ${item.sku}`, { align: 'left' })
      .text(`   Reason: ${item.reason}`, { align: 'left' })
      .moveDown(0.5);
  });

  doc.moveDown(2);
};

// Add return label instructions
const addReturnLabelInstructions = (doc) => {
  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .fillColor('#333')
    .text('Return Instructions:', { align: 'left' })
    .fontSize(10)
    .font('Helvetica')
    .fillColor('#666')
    .text('1. Package items securely', { align: 'left' })
    .text('2. Attach this label to the package', { align: 'left' })
    .text('3. Drop off at any authorized shipping location', { align: 'left' })
    .text('4. Keep tracking number for reference', { align: 'left' })
    .moveDown(2)
    .text('For questions, contact: support@elevenkart.com', { align: 'center' });
};

// Generate shipping label PDF
const generateShippingLabelPDF = async (shipment) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Add shipping label content
      addShippingLabelHeader(doc, shipment);
      addShippingLabelAddresses(doc, shipment);
      addShippingLabelDetails(doc, shipment);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

// Add shipping label header
const addShippingLabelHeader = (doc, shipment) => {
  doc
    .fontSize(18)
    .font('Helvetica-Bold')
    .fillColor('#007BFF')
    .text('SHIPPING LABEL', { align: 'center' })
    .moveDown(1)
    .fontSize(12)
    .font('Helvetica-Bold')
    .fillColor('#333')
    .text(`Tracking: ${shipment.trackingNumber}`, { align: 'center' })
    .text(`Courier: ${shipment.courier}`, { align: 'center' })
    .moveDown(2);
};

// Add shipping label addresses
const addShippingLabelAddresses = (doc, shipment) => {
  // From address
  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .fillColor('#333')
    .text('FROM:', { align: 'left' })
    .fontSize(10)
    .font('Helvetica')
    .fillColor('#666')
    .text('ElevenKart', { align: 'left' })
    .text('123 Commerce Street', { align: 'left' })
    .text('New York, NY 10001', { align: 'left' })
    .moveDown(2);

  // To address
  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .fillColor('#333')
    .text('TO:', { align: 'left' })
    .fontSize(10)
    .font('Helvetica')
    .fillColor('#666')
    .text(`${shipment.shippingAddress.firstName} ${shipment.shippingAddress.lastName}`, { align: 'left' })
    .text(shipment.shippingAddress.address, { align: 'left' })
    .text(`${shipment.shippingAddress.city}, ${shipment.shippingAddress.state} ${shipment.shippingAddress.postalCode}`, { align: 'left' })
    .text(shipment.shippingAddress.country, { align: 'left' })
    .moveDown(2);
};

// Add shipping label details
const addShippingLabelDetails = (doc, shipment) => {
  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .fillColor('#333')
    .text('Package Details:', { align: 'left' })
    .fontSize(10)
    .font('Helvetica')
    .fillColor('#666')
    .text(`Shipment ID: ${shipment.shipmentId}`, { align: 'left' })
    .text(`Items: ${shipment.items.length}`, { align: 'left' })
    .text(`Service: Standard Shipping`, { align: 'left' })
    .moveDown(2)
    .text('Handle with care. Fragile items included.', { align: 'center' });
};

module.exports = {
  generateInvoicePDF,
  generateReturnLabelPDF,
  generateShippingLabelPDF
};