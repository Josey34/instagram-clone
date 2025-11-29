import { v2 as cloudinary } from 'cloudinary';

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
export const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Determine folder based on upload type
        const folder = req.query.type || 'general';

        const imageUrl = await uploadToCloudinary(req.file.buffer, `instagram-clone/${folder}`);

        return res.status(200).json({
            message: 'Image uploaded successfully',
            url: imageUrl
        });

    } catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({
            message: 'Failed to upload image',
            error: error.message
        });
    }
};

// Delete image from Cloudinary
export const deleteImage = async (req, res) => {
    try {
        ensureCloudinaryConfigured();

        const { publicId } = req.body;

        if (!publicId) {
            return res.status(400).json({ message: 'Public ID is required' });
        }

        await cloudinary.uploader.destroy(publicId);

        return res.status(200).json({ message: 'Image deleted successfully' });

    } catch (error) {
        console.error('Delete error:', error);
        return res.status(500).json({
            message: 'Failed to delete image',
            error: error.message
        });
    }
};