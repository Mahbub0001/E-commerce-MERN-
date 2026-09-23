import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Ticket from "../models/Ticket.js";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

/**
 * Call Gemini API with structured prompt
 */
async function callGemini(prompt, systemInstruction = "") {
  if (!GEMINI_API_KEY) {
    return null;
  }

  const payload = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
  };

  if (systemInstruction) {
    payload.systemInstruction = {
      parts: [{ text: systemInstruction }],
    };
  }

  try {
    const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.warn("Gemini API returned status:", response.status);
      return null;
    }

    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (err) {
    console.warn("Gemini API call failed:", err.message);
    return null;
  }
}

/**
 * Parse JSON safely from LLM output (handles ```json fences)
 */
function extractJSON(rawText) {
  if (!rawText) return null;
  try {
    const clean = rawText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();
    return JSON.parse(clean);
  } catch {
    return null;
  }
}

/**
 * AI Sentiment & Spam Review Moderation
 */
export async function analyzeReviewWithAI(comment, rating) {
  const numericRating = Number(rating) || 5;
  const lowerComment = (comment || "").toLowerCase();

  // Negative cues (English, Banglish, Bengali)
  const negativeRegex =
    /(faltu|baje|bekar|joghonno|kharap|nosto|vua|fraud|scam|fake|churi|dhoka|cheat|terrible|worst|horrible|disaster|poor|bad|useless|damaged|broken|rubbish|waste|don't buy|never buy|ফালতু|বাজে|খারাপ|নষ্ট|ভুয়া|জঘন্য|প্রতারণা|ধোঁকা|কাজ করে না)/i;

  // Positive cues (English, Banglish, Bengali)
  const positiveRegex =
    /(valo|bhalo|osadharon|darun|khub valo|best|good|great|awesome|excellent|amazing|love|perfect|smooth|super|sundor|topnotch|ভালো|দারুণ|অসাধারণ|সেরা|সুন্দর)/i;

  let calculatedSentiment = "Neutral";
  let calculatedScore = 50;

  if (negativeRegex.test(lowerComment)) {
    calculatedSentiment = "Negative";
    calculatedScore = numericRating <= 2 ? 15 : 28;
  } else if (positiveRegex.test(lowerComment)) {
    calculatedSentiment = "Positive";
    calculatedScore = numericRating >= 4 ? 90 : 75;
  } else {
    // Rely purely on star rating if text is neutral or ambiguous
    if (numericRating >= 4) {
      calculatedSentiment = "Positive";
      calculatedScore = numericRating === 5 ? 95 : 80;
    } else if (numericRating <= 2) {
      calculatedSentiment = "Negative";
      calculatedScore = numericRating === 1 ? 15 : 30;
    } else {
      calculatedSentiment = "Neutral";
      calculatedScore = 50;
    }
  }

  // Fallback defaults
  const fallback = {
    sentiment: calculatedSentiment,
    sentimentScore: calculatedScore,
    isSpam: false,
    isFlagged: calculatedSentiment === "Negative" && numericRating <= 2,
    flagReason: null,
  };

  // Basic heuristic check for obvious spam patterns (links, spam words, repeated gibberish)
  const spamRegex = /(https?:\/\/|www\.|\.com|\.xyz|\.top|crypto|viagra|telegram|whatsapp|\+880\d{10})/i;
  if (spamRegex.test(comment)) {
    fallback.isSpam = true;
    fallback.isFlagged = true;
    fallback.flagReason = "Promotional link or suspicious contact information detected";
  }

  if (!GEMINI_API_KEY) {
    return fallback;
  }

  const prompt = `Analyze this e-commerce product customer review.
Customer Rating (1 to 5 stars): ${numericRating}
Customer Comment: "${comment}"

IMPORTANT: Pay special attention to Bengali / Banglish words (e.g., "faltu", "baje", "kharap", "nosto", "valo", "darun").
Even if a customer accidentally selects 3 or 4 stars, if the comment text says negative things like "faltu", "baje", or "waste", the sentiment MUST be "Negative".
Conversely, if the comment praises the product ("valo", "darun", "great"), the sentiment MUST be "Positive".

Evaluate:
- sentiment: "Positive" | "Neutral" | "Negative"
- sentimentScore: number from 0 to 100
- isSpam: boolean
- isFlagged: boolean
- flagReason: string or null

Respond ONLY with a JSON object in this exact schema:
{
  "sentiment": "Positive" | "Neutral" | "Negative",
  "sentimentScore": number (0-100),
  "isSpam": boolean,
  "isFlagged": boolean,
  "flagReason": string | null
}`;

  const raw = await callGemini(
    prompt,
    "You are an automated content moderation AI for an e-commerce platform. Return strict JSON."
  );

  const parsed = extractJSON(raw);
  if (parsed && typeof parsed.sentimentScore === "number") {
    return {
      sentiment: ["Positive", "Neutral", "Negative"].includes(parsed.sentiment)
        ? parsed.sentiment
        : fallback.sentiment,
      sentimentScore: Math.min(100, Math.max(0, parsed.sentimentScore)),
      isSpam: Boolean(parsed.isSpam),
      isFlagged: Boolean(parsed.isFlagged || parsed.isSpam),
      flagReason: parsed.flagReason || (parsed.isSpam ? "Identified as spam or abusive" : null),
    };
  }

  return fallback;
}

/**
 * NovaBot AI Assistant & Customer Support Ticket Router
 */
export async function processAssistantChat({ message, history = [], user = null }) {
  const userText = (message || "").trim();
  const lower = userText.toLowerCase();

  // 1. Check for Support Complaint / Ticket Intent
  const isComplaint =
    /(refund|return|damaged|broken|problem|complain|complaint|lost|cancel.*order|not received|delay|kharap|nosto|baje|ferot|taka ferot|vul product)/i.test(
      lower
    );

  if (isComplaint) {
    // Generate Support Ticket automatically
    const ticketCount = await Ticket.countDocuments();
    const ticketId = `TKT-${1000 + ticketCount + Math.floor(Math.random() * 900)}`;

    let category = "General";
    if (/refund|taka ferot/i.test(lower)) category = "Refund";
    else if (/damaged|broken|nosto/i.test(lower)) category = "Damaged Item";
    else if (/delay|late|kobe asbe/i.test(lower)) category = "Delivery Delay";
    else if (/payment|taka/i.test(lower)) category = "Payment Issue";

    const customerName = user?.name || "Customer";
    const customerEmail = user?.email || "guest@novamart.com";

    const ticket = await Ticket.create({
      ticketId,
      user: user?._id || null,
      customerName,
      customerEmail,
      subject: `Support issue: ${category}`,
      category,
      priority: category === "Refund" || category === "Damaged Item" ? "High" : "Medium",
      message: userText,
      status: "Open",
      source: "NovaBot AI",
    });

    const isBangla = /[\u0980-\u09FF]|kobe|amar|taka|ferot|nosto/i.test(userText);
    const reply = isBangla
      ? `আপনার অভিযোগটি গুরুত্ব সহকারে গ্রহণ করা হয়েছে এবং সাপোর্ট টিকেট (${ticketId}) তৈরি করা হয়েছে। আমাদের টিম খুব দ্রুত আপনার সাথে যোগাযোগ করবে।`
      : `I have logged a customer support ticket for your issue (${ticketId}) under "${category}". Our customer care team is reviewing this and will contact you promptly.`;

    return {
      reply,
      intent: "CREATE_TICKET",
      ticket: {
        _id: ticket._id,
        ticketId: ticket.ticketId,
        category: ticket.category,
        priority: ticket.priority,
        status: ticket.status,
      },
      products: [],
    };
  }

  // 2. Check for Order Tracking Intent
  const orderIdMatch = userText.match(/(?:#|order\s*(?:id|no)?:?\s*)([a-f0-9]{8,24})/i);
  if (orderIdMatch || /(where is my order|order status|amar order)/i.test(lower)) {
    let order = null;
    if (orderIdMatch) {
      const q = orderIdMatch[1];
      if (q.length === 24) {
        order = await Order.findById(q).lean();
      } else {
        const found = await Order.find({}).sort({ createdAt: -1 }).lean();
        order = found.find((o) => o._id.toString().endsWith(q));
      }
    } else if (user?._id) {
      order = await Order.findOne({ user: user._id }).sort({ createdAt: -1 }).lean();
    }

    if (order) {
      const shortId = order._id.toString().slice(-8).toUpperCase();
      const isBangla = /[\u0980-\u09FF]|amar|kobe/i.test(userText);
      const reply = isBangla
        ? `আপনার অর্ডার #${shortId}-এর বর্তমান স্ট্যাটাস: ${order.status}। মোট মূল্য: ৳${order.totalPrice}। ডেলিভারি সম্পন্ন করতে কাজ চলছে।`
        : `Your order #${shortId} is currently in "${order.status}" status. Total amount: ৳${order.totalPrice}. We are preparing your shipment.`;

      return {
        reply,
        intent: "ORDER_TRACKING",
        order: {
          _id: order._id,
          status: order.status,
          totalPrice: order.totalPrice,
        },
        products: [],
      };
    }
  }

  // 3. Product Discovery & Recommendations Intent
  const budgetMatch = lower.match(/(?:under|below|budget|within|kom dame)\s*(?:৳|tk|\$)?\s*(\d+)/i);
  const budget = budgetMatch ? Number(budgetMatch[1]) : null;

  // Search relevant products
  let query = {};
  if (budget) {
    query.price = { $lte: budget };
  }

  // Check categories
  const categories = [
    "Electronics",
    "Fashion",
    "Gaming",
    "Fitness",
    "Home",
    "Accessories",
    "Beauty & Skincare",
    "Audio & Studio",
    "Kitchen & Gourmet",
    "Books & Stationery",
  ];
  const matchedCat = categories.find((cat) => lower.includes(cat.toLowerCase().split("&")[0].trim()));
  if (matchedCat) {
    query.category = matchedCat;
  }

  let products = await Product.find(query).sort({ rating: -1, price: 1 }).limit(4).lean();

  if (!products.length && budget) {
    products = await Product.find({}).sort({ price: 1 }).limit(3).lean();
  } else if (!products.length) {
    products = await Product.find({}).sort({ rating: -1 }).limit(3).lean();
  }

  // 4. If Gemini API is available, ask Gemini to form an engaging, natural response
  if (GEMINI_API_KEY) {
    const productsContext = products
      .map((p) => `- ${p.name} (৳${p.price}, Rating: ${p.rating}★, Category: ${p.category})`)
      .join("\n");

    const prompt = `User message: "${userText}"

Catalog Products Available:
${productsContext}

Respond as "NovaBot", a friendly, knowledgeable e-commerce AI shopping assistant for NovaMart.
If the user spoke in Bengali/Banglish, reply warmly in natural Bengali. If in English, reply in English.
Keep the answer concise (2-3 sentences max) highlighting why the suggested products match their need.`;

    const aiReply = await callGemini(
      prompt,
      "You are NovaBot, a smart, polite e-commerce assistant for NovaMart. Be helpful, concise, and authentic."
    );

    if (aiReply) {
      return {
        reply: aiReply.trim(),
        intent: "PRODUCT_DISCOVERY",
        products,
      };
    }
  }

  // Fallback conversational reply
  const isBangla = /[\u0980-\u09FF]|kom|dame|bhalo|pabo/i.test(userText);
  const fallbackText = isBangla
    ? `আপনার পছন্দের জন্য সেরা কিছু প্রোডাক্ট নিচে দেওয়া হলো। কোনো নির্দিষ্ট বাজেট বা স্পেসিফিকেশন থাকলে আমাকে জানাতে পারেন!`
    : `Here are our best recommended picks for you. Let me know if you are looking for a specific category or price range!`;

  return {
    reply: fallbackText,
    intent: "PRODUCT_DISCOVERY",
    products,
  };
}
