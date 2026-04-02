const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    image: {
        type: String,
    },
    category: {
        type: String
    },
    stock: {
        type: Number,
        default: 0,
        min: 0
    },
    cloudinaryId: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

ProductSchema.index({ userId: 1 });

module.exports = mongoose.model('Product', ProductSchema);  