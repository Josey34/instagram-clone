import { v2 as cloudinary } from 'cloudinary';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';

let isConfigured = false;

// Lazy configure Cloudinary (only when first used)
const ensureCloudinaryConfigured = () => {
    if (!isConfigured) {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });
        isConfigured = true;
    }
};

// Helper function to upload image buffer to Cloudinary
export const uploadToCloudinary = (fileBuffer, folder) => {
    ensureCloudinaryConfigured();

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folder,
                resource_type: 'image',
                transformation: [
                    { width: 1080, height: 1080, crop: 'limit' }, // Max dimensions
                    { quality: 'auto' }, // Auto quality optimization
                    { fetch_format: 'auto' } // Auto format (WebP when supported)
                ]
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result.secure_url);
                }
            }
        );
        uploadStream.end(fileBuffer);
    });
};

// Upload single image
export const uploadImage = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new AppError('No file uploaded', 400);
    }

    // Determine folder based on upload type
    const folder = req.query.type || 'general';

    const imageUrl = await uploadToCloudinary(req.file.buffer, `instagram-clone/${folder}`);

    return res.status(200).json({
        message: 'Image uploaded successfully',
        url: imageUrl
    });
});

// Delete image from Cloudinary
export const deleteImage = asyncHandler(async (req, res) => {
    ensureCloudinaryConfigured();

    const { publicId } = req.body;

    if (!publicId) {
        throw new AppError('Public ID is required', 400);
    }

    await cloudinary.uploader.destroy(publicId);

    return res.status(200).json({ message: 'Image deleted successfully' });
});