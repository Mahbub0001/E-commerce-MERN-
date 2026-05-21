export function normalizeProduct(product) {
  if (!product) return product;

  const oldPrice = product.oldPrice && product.oldPrice > 0 ? product.oldPrice : product.price;
  const countInStock = product.countInStock ?? product.stock ?? 0;

  return {
    ...product,
    reviews: product.reviews ?? product.numReviews ?? 0,
    numReviews: product.numReviews ?? product.reviews ?? 0,
    stock: countInStock,
    countInStock,
    oldPrice,
    badge: product.badge || (product.isFeatured ? "Featured" : product.isOnSale ? "Sale" : "Popular"),
  };
}
