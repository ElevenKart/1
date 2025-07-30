const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload image to Cloudinary
const uploadToCloudinary = async (file, folder = 'elevenkart') => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: folder,
      resource_type: 'auto',
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    });

    return {
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image');
  }
};

// Upload video to Cloudinary
const uploadVideoToCloudinary = async (file, folder = 'elevenkart/videos') => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: folder,
      resource_type: 'video',
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ],
      eager: [
        { width: 640, height: 480, crop: 'scale' },
        { width: 320, height: 240, crop: 'scale' }
      ],
      eager_async: true
    });

    return {
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes,
      duration: result.duration
    };
  } catch (error) {
    console.error('Cloudinary video upload error:', error);
    throw new Error('Failed to upload video');
  }
};

// Delete file from Cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete file');
  }
};

// Generate optimized image URL
const getOptimizedImageUrl = (publicId, options = {}) => {
  const defaultOptions = {
    quality: 'auto:good',
    fetch_format: 'auto',
    ...options
  };

  return cloudinary.url(publicId, defaultOptions);
};

// Generate thumbnail URL
const getThumbnailUrl = (publicId, width = 300, height = 300) => {
  return cloudinary.url(publicId, {
    width,
    height,
    crop: 'fill',
    quality: 'auto:good',
    fetch_format: 'auto'
  });
};

// Generate responsive image URLs
const getResponsiveImageUrls = (publicId) => {
  const sizes = [
    { width: 320, height: 240 },
    { width: 640, height: 480 },
    { width: 1024, height: 768 },
    { width: 1920, height: 1080 }
  ];

  return sizes.map(size => ({
    ...size,
    url: cloudinary.url(publicId, {
      width: size.width,
      height: size.height,
      crop: 'fill',
      quality: 'auto:good',
      fetch_format: 'auto'
    })
  }));
};

// Upload multiple images
const uploadMultipleImages = async (files, folder = 'elevenkart') => {
  try {
    const uploadPromises = files.map(file => uploadToCloudinary(file, folder));
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Multiple images upload error:', error);
    throw new Error('Failed to upload multiple images');
  }
};

// Generate image transformation URL
const transformImage = (publicId, transformations = {}) => {
  return cloudinary.url(publicId, transformations);
};

// Get image info
const getImageInfo = async (publicId) => {
  try {
    const result = await cloudinary.api.resource(publicId);
    return {
      public_id: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes,
      created_at: result.created_at
    };
  } catch (error) {
    console.error('Get image info error:', error);
    throw new Error('Failed to get image info');
  }
};

// Create image collage
const createCollage = async (publicIds, options = {}) => {
  try {
    const defaultOptions = {
      width: 800,
      height: 600,
      rows: 2,
      cols: 2,
      ...options
    };

    const result = await cloudinary.api.create_collage({
      public_ids: publicIds,
      ...defaultOptions
    });

    return result;
  } catch (error) {
    console.error('Create collage error:', error);
    throw new Error('Failed to create collage');
  }
};

module.exports = {
  uploadToCloudinary,
  uploadVideoToCloudinary,
  deleteFromCloudinary,
  getOptimizedImageUrl,
  getThumbnailUrl,
  getResponsiveImageUrls,
  uploadMultipleImages,
  transformImage,
  getImageInfo,
  createCollage
};