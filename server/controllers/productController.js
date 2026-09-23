import Product from "../models/Product.js";
import { analyzeReviewWithAI } from "../services/aiService.js";

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

export async function createProductReview(req, res, next) {
  try {
    const { rating, comment } = req.body;
    const numericRating = Number(rating);

    if (!numericRating || numericRating < 1 || numericRating > 5) {
      res.status(400);
      throw new Error("Rating must be a number between 1 and 5");
    }

    if (!comment || !comment.trim()) {
      res.status(400);
      throw new Error("Review comment is required");
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error("You have already reviewed this product");
    }

    // Run AI review moderation and sentiment analysis
    const aiAnalysis = await analyzeReviewWithAI(comment.trim(), numericRating);

    const review = {
      user: req.user._id,
      name: req.user.name || "Customer",
      rating: numericRating,
      comment: comment.trim(),
      sentiment: aiAnalysis.sentiment,
      sentimentScore: aiAnalysis.sentimentScore,
      isSpam: aiAnalysis.isSpam,
      isFlagged: aiAnalysis.isFlagged,
      flagReason: aiAnalysis.flagReason,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({
      success: true,
      message: "Review added successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllReviews(req, res, next) {
  try {
    const products = await Product.find({ "reviews.0": { $exists: true } })
      .select("name image slug reviews")
      .lean();

    const allReviews = [];
    for (const prod of products) {
      for (const rev of prod.reviews || []) {
        allReviews.push({
          _id: rev._id,
          productId: prod._id,
          productName: prod.name,
          productImage: prod.image,
          productSlug: prod.slug,
          userId: rev.user,
          name: rev.name,
          rating: rev.rating,
          comment: rev.comment,
          sentiment: rev.sentiment || (rev.rating >= 4 ? "Positive" : rev.rating === 3 ? "Neutral" : "Negative"),
          sentimentScore: rev.sentimentScore || (rev.rating >= 4 ? 85 : 50),
          isSpam: Boolean(rev.isSpam),
          isFlagged: Boolean(rev.isFlagged || rev.isSpam),
          flagReason: rev.flagReason || null,
          createdAt: rev.createdAt,
        });
      }
    }

    allReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({ success: true, data: allReviews });
  } catch (error) {
    next(error);
  }
}

export async function deleteProductReview(req, res, next) {
  try {
    const { id, reviewId } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    const reviewIndex = product.reviews.findIndex(
      (r) => r._id.toString() === reviewId
    );

    if (reviewIndex === -1) {
      res.status(404);
      throw new Error("Review not found");
    }

    product.reviews.splice(reviewIndex, 1);
    product.numReviews = product.reviews.length;
    product.rating = product.reviews.length
      ? product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length
      : 0;

    await product.save();
    res.status(200).json({
      success: true,
      message: "Review removed successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
}

