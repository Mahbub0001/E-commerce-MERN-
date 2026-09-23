export function normalizeProduct(product) {
  if (!product) return product;

  const oldPrice = product.oldPrice && product.oldPrice > 0 ? product.oldPrice : product.price;
  const countInStock = product.countInStock ?? product.stock ?? 0;
  const reviewsList = Array.isArray(product.reviews) ? product.reviews : [];
  const numReviews = typeof product.numReviews === "number" ? product.numReviews : reviewsList.length;

  return {
    ...product,
    reviewsList,
    reviews: numReviews,
    numReviews,
    stock: countInStock,
    countInStock,
    oldPrice,
    badge: product.badge || (product.isFeatured ? "Featured" : product.isOnSale ? "Sale" : "Popular"),
  };
}
