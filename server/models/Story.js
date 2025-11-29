import mongoose from "mongoose";

const storySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    image: {
        type: String,
        required: true,
        trim: true
    },
    expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 24 * 60 * 60 * 1000)
    },
    viewedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { timestamps: true });

storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

storySchema.virtual('viewCount').get(function() {
    return this.viewedBy.length;
});

storySchema.set('toJSON', { virtuals: true });
storySchema.set('toObject', { virtuals: true });

const Story = mongoose.model('Story', storySchema);

export default Story;