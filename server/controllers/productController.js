import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { analyzeReviewWithAI, recommendProductsWithAI } from "../services/aiService.js";

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

    if (req.query.category && req.query.category.trim().toLowerCase() !== "all") {
      filters.category = {
        $regex: `^\\s*${req.query.category.trim().replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}\\s*$`,
        $options: "i",
      };
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
        let sentiment = rev.sentiment;
        let sentimentScore = rev.sentimentScore;
        let isSpam = rev.isSpam;
        let isFlagged = rev.isFlagged;
        let flagReason = rev.flagReason;

        // Dynamic recheck: Ensure sentiment accurately reflects current AI rules/cues
        const recheck = await analyzeReviewWithAI(rev.comment, rev.rating);
        if (!sentiment || sentiment !== recheck.sentiment || isSpam !== recheck.isSpam) {
          sentiment = recheck.sentiment;
          sentimentScore = recheck.sentimentScore;
          isSpam = recheck.isSpam;
          isFlagged = recheck.isFlagged;
          flagReason = recheck.flagReason;

          // Asynchronously update in DB to permanently persist the correct sentiment
          Product.updateOne(
            { _id: prod._id, "reviews._id": rev._id },
            {
              $set: {
                "reviews.$.sentiment": sentiment,
                "reviews.$.sentimentScore": sentimentScore,
                "reviews.$.isSpam": isSpam,
                "reviews.$.isFlagged": isFlagged,
                "reviews.$.flagReason": flagReason,
              },
            }
          ).catch((e) => console.warn("Failed to persist rechecked review sentiment:", e.message));
        }

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
          sentiment,
          sentimentScore: sentimentScore ?? 50,
          isSpam: Boolean(isSpam),
          isFlagged: Boolean(isFlagged || isSpam),
          flagReason: flagReason || null,
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

export async function getProductCategories(req, res, next) {
  try {
    const rawCategories = await Product.distinct("category");
    const categoryMap = new Map();

    for (const cat of rawCategories) {
      if (!cat || typeof cat !== "string") continue;
      const trimmed = cat.trim();
      if (!trimmed) continue;
      const lower = trimmed.toLowerCase();
      if (!categoryMap.has(lower)) {
        // Keep a well-formatted title casing
        const formatted = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
        categoryMap.set(lower, formatted);
      }
    }

    const categories = Array.from(categoryMap.values()).sort((a, b) =>
      a.localeCompare(b)
    );

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Intelligent Related Products & Frequently Bought Together Bundle
 */
export async function getProductRecommendations(req, res, next) {
  try {
    const { id } = req.params;
    let currentProduct = null;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      currentProduct = await Product.findById(id);
    }
    if (!currentProduct) {
      currentProduct = await Product.findOne({ slug: id.toLowerCase() });
    }

    if (!currentProduct) {
      res.status(404);
      throw new Error("Product not found");
    }

    // Fetch candidate pool
    const candidates = await Product.find({
      _id: { $ne: currentProduct._id },
    }).limit(40);

    const currentTags = new Set(
      (currentProduct.tags || []).map((t) => t.toLowerCase())
    );

    // Score relevance
    const scored = candidates.map((cand) => {
      let score = 0;
      if (cand.category.toLowerCase() === currentProduct.category.toLowerCase()) {
        score += 35;
      }
      if (cand.brand.toLowerCase() === currentProduct.brand.toLowerCase()) {
        score += 15;
      }

      const candTags = (cand.tags || []).map((t) => t.toLowerCase());
      let tagMatches = 0;
      for (const t of candTags) {
        if (currentTags.has(t)) tagMatches++;
      }
      score += tagMatches * 15;
      score += (cand.rating || 0) * 4;

      const priceRatio =
        Math.min(cand.price, currentProduct.price) /
        Math.max(cand.price, currentProduct.price);
      score += priceRatio * 10;

      return { product: cand, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const related = scored.slice(0, 4).map((s) => s.product);

    // Frequently bought together companion
    const bundleProduct =
      scored.find(
        (s) =>
          s.product.price <= currentProduct.price * 1.5 &&
          s.product._id.toString() !== currentProduct._id.toString()
      )?.product || related[0] || null;

    let bundle = null;
    if (bundleProduct) {
      const originalTotal = currentProduct.price + bundleProduct.price;
      const discountPercent = 10; // 10% bundle discount
      const bundlePrice = Math.round(originalTotal * 0.9);
      const savings = originalTotal - bundlePrice;

      bundle = {
        mainProduct: {
          _id: currentProduct._id,
          name: currentProduct.name,
          price: currentProduct.price,
          image: currentProduct.image,
          category: currentProduct.category,
        },
        bundleProduct: {
          _id: bundleProduct._id,
          name: bundleProduct.name,
          price: bundleProduct.price,
          image: bundleProduct.image,
          category: bundleProduct.category,
        },
        discountPercent,
        bundlePrice,
        originalTotal,
        savings,
      };
    }

    res.status(200).json({
      success: true,
      data: {
        related,
        bundle,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Personalized & Trending Recommendations for Homepage / User Feed
 */
export async function getPersonalizedRecommendations(req, res, next) {
  try {
    let preferredCategories = [];

    if (req.user) {
      const orders = await Order.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .limit(5);

      const catSet = new Set();
      for (const order of orders) {
        for (const item of order.orderItems || []) {
          if (item.category) catSet.add(item.category);
        }
      }
      preferredCategories = Array.from(catSet);
    }

    let forYouQuery = {};
    if (preferredCategories.length > 0) {
      forYouQuery = {
        category: {
          $in: preferredCategories.map((c) => new RegExp(`^${c}$`, "i")),
        },
      };
    } else {
      forYouQuery = { rating: { $gte: 4.6 } };
    }

    const [forYou, trending, flashDeals] = await Promise.all([
      Product.find(forYouQuery).sort({ rating: -1, numReviews: -1 }).limit(8),
      Product.find({}).sort({ numReviews: -1, rating: -1 }).limit(8),
      Product.find({ isOnSale: true }).sort({ createdAt: -1 }).limit(8),
    ]);

    res.status(200).json({
      success: true,
      data: {
        forYou: forYou.length > 0 ? forYou : trending.slice(0, 8),
        trending,
        flashDeals,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Gemini AI Conversational Shopping Advisor
 */
export async function getAIShoppingAdvice(req, res, next) {
  try {
    const { query } = req.body;
    if (!query || typeof query !== "string") {
      res.status(400);
      throw new Error("Search or advice query is required");
    }

    const allProducts = await Product.find(
      {},
      "name category brand price rating numReviews tags features description image"
    );

    const aiResult = await recommendProductsWithAI({
      query,
      products: allProducts,
      userContext: req.user ? { name: req.user.name } : {},
    });

    const productMap = new Map();
    allProducts.forEach((p) => productMap.set(p._id.toString(), p));

    const recommendedProducts = (aiResult.productIds || [])
      .map((id) => productMap.get(id))
      .filter(Boolean);

    res.status(200).json({
      success: true,
      data: {
        summary: aiResult.summary,
        products: recommendedProducts,
        tips: aiResult.tips || [],
      },
    });
  } catch (error) {
    next(error);
  }
}


