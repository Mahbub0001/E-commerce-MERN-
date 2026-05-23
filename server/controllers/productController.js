import Product from "../models/Product.js";

/** Base64 image strings above this often exceed Vercel's ~4.5MB request body limit. */
const MAX_IMAGE_FIELD_LENGTH = 1_500_000;

function rejectOversizedImage(image, res) {
  if (typeof image === "string" && image.length > MAX_IMAGE_FIELD_LENGTH) {
    res.status(413);
    throw new Error(
      "Image is too large. Re-upload a smaller file; the admin form compresses images automatically."
    );
  }
}

export async function getProducts(req, res, next) {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 10, 1);
    const skip = (page - 1) * limit;

    const filters = {};

    if (req.query.keyword) {
      filters.name = { $regex: req.query.keyword, $options: "i" };
    }

    if (req.query.category) {
      filters.category = req.query.category;
    }

    if (req.query.minPrice || req.query.maxPrice) {
      filters.price = {};
      if (req.query.minPrice) filters.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) filters.price.$lte = Number(req.query.maxPrice);
    }

    if (req.query.rating) {
      filters.rating = { $gte: Number(req.query.rating) };
    }

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      rating_desc: { rating: -1 },
      name_asc: { name: 1 },
      name_desc: { name: -1 },
    };
    const sortBy = sortMap[req.query.sort] || { createdAt: -1 };

    const [products, total] = await Promise.all([
      Product.find(filters).sort(sortBy).skip(skip).limit(limit),
      Product.countDocuments(filters),
    ]);

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getProductById(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
}

export async function getProductBySlug(req, res, next) {
  try {
    const product = await Product.findOne({ slug: req.params.slug.toLowerCase() });
    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
}

export async function getFeaturedProducts(req, res, next) {
  try {
    const limit = Math.max(Number(req.query.limit) || 8, 1);
    const products = await Product.find({ isFeatured: true }).sort({ createdAt: -1 }).limit(limit);
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
}

export async function searchProducts(req, res, next) {
  try {
    const keyword = req.query.keyword?.trim();
    if (!keyword) {
      res.status(400);
      throw new Error("keyword query param is required");
    }

    const products = await Product.find({
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
        { category: { $regex: keyword, $options: "i" } },
        { brand: { $regex: keyword, $options: "i" } },
        { tags: { $elemMatch: { $regex: keyword, $options: "i" } } },
      ],
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
}

export async function createProduct(req, res, next) {
  try {
    rejectOversizedImage(req.body.image, res);

    const product = await Product.create({
      name: req.body.name || "New Product",
      slug: req.body.slug || `new-product-${Date.now()}`,
      brand: req.body.brand || "NovaMart",
      category: req.body.category || "General",
      description: req.body.description || "Add product description",
      image: req.body.image || "https://placehold.co/800x800?text=NovaMart+Product",
      images: req.body.images || [],
      price: req.body.price ?? 0,
      oldPrice: req.body.oldPrice ?? 0,
      countInStock: req.body.countInStock ?? 0,
      rating: req.body.rating ?? 0,
      numReviews: req.body.numReviews ?? 0,
      isFeatured: req.body.isFeatured ?? false,
      isOnSale: req.body.isOnSale ?? false,
      tags: req.body.tags || [],
      features: req.body.features || [],
    });
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
}

export async function updateProduct(req, res, next) {
  try {
    if (req.body.image !== undefined) {
      rejectOversizedImage(req.body.image, res);
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    product.name = req.body.name ?? product.name;
    product.slug = req.body.slug ?? product.slug;
    product.brand = req.body.brand ?? product.brand;
    product.category = req.body.category ?? product.category;
    product.description = req.body.description ?? product.description;
    product.image = req.body.image ?? product.image;
    product.images = req.body.images ?? product.images;
    product.price = req.body.price ?? product.price;
    product.oldPrice = req.body.oldPrice ?? product.oldPrice;
    product.countInStock = req.body.countInStock ?? product.countInStock;
    product.rating = req.body.rating ?? product.rating;
    product.numReviews = req.body.numReviews ?? product.numReviews;
    product.isFeatured = req.body.isFeatured ?? product.isFeatured;
    product.isOnSale = req.body.isOnSale ?? product.isOnSale;
    product.tags = req.body.tags ?? product.tags;
    product.features = req.body.features ?? product.features;

    const updatedProduct = await product.save();
    res.status(200).json({ success: true, data: updatedProduct });
  } catch (error) {
    next(error);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    await Product.deleteOne({ _id: req.params.id });
    res.status(200).json({ success: true, data: { message: "Product removed" } });
  } catch (error) {
    next(error);
  }
}
