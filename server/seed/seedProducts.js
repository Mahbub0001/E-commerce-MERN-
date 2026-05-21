import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import Product from "../models/Product.js";

dotenv.config();

const baseProducts = [
  { name: "Aurora Noise-Cancel Headphones", category: "Electronics", brand: "Aurora Audio", price: 249, oldPrice: 319, rating: 4.8, numReviews: 412, countInStock: 34, isFeatured: true, tags: ["audio", "wireless", "premium"], features: ["Active noise cancellation", "40-hour battery life", "Hi-res wireless audio"], image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80" },
  { name: "Zenith Smartwatch Pro", category: "Electronics", brand: "Zenith", price: 299, oldPrice: 379, rating: 4.7, numReviews: 355, countInStock: 28, isFeatured: true, tags: ["wearable", "health", "smartwatch"], features: ["AMOLED always-on display", "Sleep and heart tracking", "5ATM water resistance"], image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80" },
  { name: "Nebula 4K Action Camera", category: "Electronics", brand: "Nebula Optics", price: 219, oldPrice: 279, rating: 4.5, numReviews: 188, countInStock: 22, isFeatured: false, tags: ["camera", "travel", "4k"], features: ["4K60 recording", "Stabilized footage", "Waterproof housing"], image: "https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?auto=format&fit=crop&w=1200&q=80" },
  { name: "AeroBook Carbon 14", category: "Electronics", brand: "AeroCompute", price: 1399, oldPrice: 1599, rating: 4.9, numReviews: 132, countInStock: 15, isFeatured: true, tags: ["laptop", "productivity", "ultrabook"], features: ["14-inch 2.8K display", "Carbon fiber chassis", "All-day battery"], image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=80" },
  { name: "Lumen Bluetooth Speaker", category: "Electronics", brand: "Lumen Sound", price: 159, oldPrice: 209, rating: 4.6, numReviews: 241, countInStock: 40, isFeatured: false, tags: ["speaker", "portable", "party"], features: ["360-degree sound", "IPX7 splash resistance", "Deep bass tuning"], image: "https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&w=1200&q=80" },

  { name: "AeroFlex Tailored Blazer", category: "Fashion", brand: "Aero Style", price: 179, oldPrice: 229, rating: 4.6, numReviews: 205, countInStock: 26, isFeatured: true, tags: ["blazer", "minimal", "premium"], features: ["Wrinkle-resistant fabric", "Slim tailored silhouette", "Breathable inner lining"], image: "https://images.unsplash.com/photo-1593032465171-8bd2f2cf7d8d?auto=format&fit=crop&w=1200&q=80" },
  { name: "Monarch Leather Sneakers", category: "Fashion", brand: "Monarch", price: 149, oldPrice: 189, rating: 4.4, numReviews: 168, countInStock: 33, isFeatured: false, tags: ["sneakers", "streetwear", "leather"], features: ["Full-grain leather upper", "Cushioned midsole", "Anti-slip rubber outsole"], image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80" },
  { name: "Velvet Drape Evening Dress", category: "Fashion", brand: "Velveton", price: 199, oldPrice: 259, rating: 4.7, numReviews: 124, countInStock: 18, isFeatured: true, tags: ["dress", "evening", "luxury"], features: ["Soft velvet blend", "Elegant draped silhouette", "Concealed back zip"], image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80" },
  { name: "Urban Weave Backpack", category: "Fashion", brand: "Urban Weave", price: 119, oldPrice: 149, rating: 4.5, numReviews: 194, countInStock: 37, isFeatured: false, tags: ["backpack", "commute", "everyday"], features: ["Laptop sleeve", "Water-resistant shell", "Ergonomic shoulder straps"], image: "https://images.unsplash.com/photo-1509762774605-f07235a08f1f?auto=format&fit=crop&w=1200&q=80" },
  { name: "Noir Slim Chronograph", category: "Fashion", brand: "Noir Time", price: 229, oldPrice: 299, rating: 4.8, numReviews: 146, countInStock: 21, isFeatured: true, tags: ["watch", "chronograph", "accessory"], features: ["Sapphire-coated glass", "Japanese quartz movement", "Stainless steel case"], image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=80" },

  { name: "Titan Adjustable Dumbbell Set", category: "Fitness", brand: "TitanFit", price: 349, oldPrice: 429, rating: 4.9, numReviews: 287, countInStock: 19, isFeatured: true, tags: ["gym", "weights", "home workout"], features: ["5-40kg quick adjust", "Space-saving design", "Knurled metal grip"], image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80" },
  { name: "PulseRun Carbon Shoes", category: "Fitness", brand: "PulseRun", price: 189, oldPrice: 239, rating: 4.6, numReviews: 213, countInStock: 31, isFeatured: false, tags: ["running", "shoes", "performance"], features: ["Carbon plate propulsion", "Breathable mesh upper", "Shock-absorbing foam"], image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1200&q=80" },
  { name: "CoreBalance Yoga Mat Pro", category: "Fitness", brand: "CoreBalance", price: 89, oldPrice: 119, rating: 4.5, numReviews: 175, countInStock: 48, isFeatured: false, tags: ["yoga", "mat", "wellness"], features: ["Non-slip natural rubber", "6mm joint support", "Alignment guide texture"], image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80" },
  { name: "HydraSteel Smart Bottle", category: "Fitness", brand: "HydraSteel", price: 69, oldPrice: 99, rating: 4.3, numReviews: 132, countInStock: 62, isFeatured: false, tags: ["hydration", "smart", "lifestyle"], features: ["Hydration reminders", "Double-wall insulation", "App sync tracking"], image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=1200&q=80" },
  { name: "StrideMax Resistance Kit", category: "Fitness", brand: "StrideMax", price: 109, oldPrice: 149, rating: 4.4, numReviews: 121, countInStock: 29, isFeatured: false, tags: ["bands", "strength", "portable"], features: ["5 resistance levels", "Door anchor included", "Travel-friendly pouch"], image: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?auto=format&fit=crop&w=1200&q=80" },

  { name: "Vortex X Gaming Console", category: "Gaming", brand: "Vortex", price: 599, oldPrice: 699, rating: 4.8, numReviews: 419, countInStock: 13, isFeatured: true, tags: ["console", "4k", "nextgen"], features: ["4K ultra-fast rendering", "Ray-traced graphics", "1TB SSD storage"], image: "https://images.unsplash.com/photo-1486401899868-0e435ed85128?auto=format&fit=crop&w=1200&q=80" },
  { name: "Phantom RGB Mechanical Keyboard", category: "Gaming", brand: "Phantom Gear", price: 159, oldPrice: 209, rating: 4.7, numReviews: 256, countInStock: 24, isFeatured: false, tags: ["keyboard", "rgb", "mechanical"], features: ["Hot-swappable switches", "Per-key RGB lighting", "Low-latency response"], image: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?auto=format&fit=crop&w=1200&q=80" },
  { name: "Apex Pro Gaming Mouse", category: "Gaming", brand: "Apex", price: 99, oldPrice: 139, rating: 4.6, numReviews: 302, countInStock: 45, isFeatured: false, tags: ["mouse", "esports", "wireless"], features: ["26K DPI optical sensor", "Ultra-light shell", "70-hour battery"], image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=1200&q=80" },
  { name: "Immersion 34 Curved Monitor", category: "Gaming", brand: "Immersion", price: 729, oldPrice: 889, rating: 4.8, numReviews: 144, countInStock: 12, isFeatured: true, tags: ["monitor", "ultrawide", "144hz"], features: ["34-inch ultrawide QHD", "165Hz refresh rate", "1ms response time"], image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=1200&q=80" },
  { name: "EchoPulse Gaming Headset", category: "Gaming", brand: "EchoPulse", price: 139, oldPrice: 179, rating: 4.5, numReviews: 212, countInStock: 38, isFeatured: false, tags: ["headset", "surround", "mic"], features: ["7.1 surround audio", "Detachable noise-cancel mic", "Memory foam earcups"], image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=1200&q=80" },

  { name: "Luma Smart Ambient Lamp", category: "Home", brand: "Luma Home", price: 129, oldPrice: 169, rating: 4.6, numReviews: 173, countInStock: 27, isFeatured: false, tags: ["lighting", "smart home", "decor"], features: ["Voice assistant compatible", "16M color scenes", "Schedule automation"], image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=80" },
  { name: "PureBrew Precision Kettle", category: "Home", brand: "PureBrew", price: 119, oldPrice: 149, rating: 4.5, numReviews: 149, countInStock: 41, isFeatured: false, tags: ["kitchen", "coffee", "electric"], features: ["Gooseneck precision pour", "Temperature presets", "Quick boil system"], image: "https://images.unsplash.com/photo-1571552879083-e93b6ea70d1d?auto=format&fit=crop&w=1200&q=80" },
  { name: "AirNest Aroma Diffuser", category: "Home", brand: "AirNest", price: 79, oldPrice: 109, rating: 4.4, numReviews: 117, countInStock: 52, isFeatured: false, tags: ["aroma", "wellness", "decor"], features: ["Ultrasonic misting", "Whisper-quiet operation", "Auto shut-off protection"], image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=80" },
  { name: "Nexa Robot Vacuum S2", category: "Home", brand: "Nexa", price: 449, oldPrice: 569, rating: 4.7, numReviews: 263, countInStock: 17, isFeatured: true, tags: ["vacuum", "smart", "cleaning"], features: ["LiDAR room mapping", "Auto-empty dock support", "App and voice controls"], image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80" },
  { name: "Breeze Linen Bedding Set", category: "Home", brand: "Breeze", price: 169, oldPrice: 219, rating: 4.6, numReviews: 98, countInStock: 23, isFeatured: false, tags: ["bedding", "linen", "comfort"], features: ["Breathable stonewashed linen", "Hypoallergenic fabric", "Deep-pocket fitted sheet"], image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80" },

  { name: "Orbit USB-C Dock Pro", category: "Accessories", brand: "Orbit", price: 189, oldPrice: 249, rating: 4.7, numReviews: 207, countInStock: 35, isFeatured: false, tags: ["dock", "usb-c", "workspace"], features: ["Dual 4K display output", "100W passthrough charging", "SD and Ethernet ports"], image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80" },
  { name: "Aether MagSafe Power Bank", category: "Accessories", brand: "Aether", price: 89, oldPrice: 119, rating: 4.5, numReviews: 189, countInStock: 58, isFeatured: false, tags: ["power bank", "magsafe", "travel"], features: ["10,000mAh capacity", "Magnetic snap charging", "USB-C fast output"], image: "https://images.unsplash.com/photo-1587033411391-5d9e51cce126?auto=format&fit=crop&w=1200&q=80" },
  { name: "Luxe Leather Laptop Sleeve", category: "Accessories", brand: "Luxe Carry", price: 109, oldPrice: 149, rating: 4.6, numReviews: 141, countInStock: 30, isFeatured: false, tags: ["laptop", "sleeve", "leather"], features: ["Premium vegan leather", "Soft anti-scratch interior", "Magnetic secure closure"], image: "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=1200&q=80" },
  { name: "Vertex Pro Webcam 4K", category: "Accessories", brand: "Vertex", price: 169, oldPrice: 219, rating: 4.4, numReviews: 133, countInStock: 42, isFeatured: false, tags: ["webcam", "remote work", "4k"], features: ["4K clarity sensor", "Auto-light correction", "Dual beamforming microphones"], image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=80" },
  { name: "PulseCharge Braided Cable Kit", category: "Accessories", brand: "PulseCharge", price: 49, oldPrice: 69, rating: 4.3, numReviews: 264, countInStock: 76, isFeatured: false, tags: ["cable", "charging", "durable"], features: ["Reinforced braided nylon", "USB-C / Lightning kit", "Fast-charge certified"], image: "https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=1200&q=80" },
];

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const sampleProducts = baseProducts.map((product, index) => {
  const isOnSale = product.oldPrice > product.price;
  const imageSet = [
    `${product.image}`,
    `${product.image}&sat=-8`,
    `${product.image}&hue=10`,
    `${product.image}&contrast=5`,
  ];

  return {
    name: product.name,
    slug: `${slugify(product.name)}-${index + 1}`,
    description: `${product.name} delivers premium design, reliable performance, and refined everyday experience for modern lifestyles.`,
    price: product.price,
    oldPrice: product.oldPrice,
    category: product.category,
    brand: product.brand,
    image: product.image,
    images: imageSet,
    rating: product.rating,
    numReviews: product.numReviews,
    countInStock: product.countInStock,
    isFeatured: product.isFeatured,
    isOnSale,
    tags: product.tags,
    features: product.features,
  };
});

async function seedProducts() {
  try {
    await connectDB();
    await Product.deleteMany({});
    await Product.insertMany(sampleProducts);
    console.log(`Seed complete: ${sampleProducts.length} premium products inserted`);
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
}

seedProducts();
