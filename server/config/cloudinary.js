import { v2 as cloudinary } from 'cloudinary';

// Option 1: Use the CLOUDINARY_URL directly (easiest)
cloudinary.config({
    cloudinary_url: process.env.CLOUDINARY_URL
});

// The URL format is: cloudinary://API_KEY:API_SECRET@CLOUD_NAME

export default cloudinary;