const { uploadImage, deleteImage } = require('../services/cloudinaryService.js');
const Product = require('../models/Product');
const redisCache = require('../services/redisCache.js');

const getProducts = async (req, res, next) => {
    try {
        const cacheKey = `products:${req.user.id}`;
        const cachedProducts = await redisCache.getCache(cacheKey);
        if (cachedProducts) {
            return res.status(200).json({ success: true, data: cachedProducts });
        }
        const products = await Product.find({ userId: req.user.id, isActive: true });
        await redisCache.setCache(cacheKey, products, 300);
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        next({ statusCode: 500, message: error.message });
    }
};


const createProduct = async (req, res, next) => {
    try {
        const { name, price, category, stock } = req.body;
        const image = req.file ? await uploadImage(req.file.buffer, 'pos/products') : null;
        const product = await Product.create({
            name,
            price,
            category,
            stock,
            image: image?.url,
            cloudinaryId: image?.publicId,
            userId: req.user.id
        });
        await redisCache.deleteCache(`products:${req.user.id}`);
        res.status(201).json({ success: true, data: product });
    } catch (error) {
        next({ statusCode: 500, message: error.message });
    }
};

const updateProduct = async (req, res, next) => {
    try {
        const product = await Product.findOne({ _id: req.params.id, userId: req.user.id });
        if (!product) {
            return next({ statusCode: 404, message: 'Product not found' });
        }
        if (req.file) {
            const image = await uploadImage(req.file.buffer, 'pos/products');
            if (product.cloudinaryId) {
                await deleteImage(product.cloudinaryId);
            }
            product.image = image?.url;
            product.cloudinaryId = image?.publicId;
        }
        product.name = req.body.name ?? product.name;
        product.price = req.body.price ?? product.price;
        product.category = req.body.category ?? product.category;
        product.stock = req.body.stock ?? product.stock;
        await product.save();
        await redisCache.deleteCache(`products:${req.user.id}`);
        res.status(200).json({ success: true, data: product });
    }
    catch (error) {
        next({ statusCode: 500, message: error.message });
    }
};

const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findOne({ _id: req.params.id, userId: req.user.id });
        if (!product) {
            return next({ statusCode: 404, message: 'Product not found' });
        }
        if (product.cloudinaryId) {
            await deleteImage(product.cloudinaryId);
        }
        product.isActive = false;
        await product.save();
        await redisCache.deleteCache(`products:${req.user.id}`);
        res.status(200).json({ success: true, data: product });
    }
    catch (error) {
        next({ statusCode: 500, message: error.message });
    }
};
module.exports = { getProducts, createProduct, updateProduct, deleteProduct };