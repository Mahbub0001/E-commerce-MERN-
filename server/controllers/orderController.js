import Order from "../models/Order.js";
import Product from "../models/Product.js";

const ALLOWED_PAYMENT_METHODS = ["Cash on Delivery", "Demo Card", "Mobile Banking Demo"];

function round2(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export async function createOrder(req, res, next) {
  try {
    const { orderItems, shippingAddress, paymentMethod } = req.body;

    if (!orderItems || orderItems.length === 0) {
      res.status(400);
      throw new Error("No order items");
    }

    if (!shippingAddress?.address || !shippingAddress?.city || !shippingAddress?.postalCode || !shippingAddress?.country) {
      res.status(400);
      throw new Error("Complete shipping address is required");
    }

    if (!ALLOWED_PAYMENT_METHODS.includes(paymentMethod)) {
      res.status(400);
      throw new Error(`Payment method must be one of: ${ALLOWED_PAYMENT_METHODS.join(", ")}`);
    }

    const normalizedItems = [];
    let itemsPrice = 0;

    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        res.status(404);
        throw new Error(`Product not found: ${item.product}`);
      }

      if (item.quantity > product.countInStock) {
        res.status(400);
        throw new Error(`Insufficient stock for product: ${product.name}`);
      }

      const unitPrice = Number(product.price);
      itemsPrice += unitPrice * Number(item.quantity);

      normalizedItems.push({
        product: product._id,
        name: product.name,
        image: product.image,
        price: unitPrice,
        quantity: Number(item.quantity),
      });
    }

    itemsPrice = round2(itemsPrice);
    const shippingPrice = itemsPrice > 250 ? 0 : 12;
    const taxPrice = round2(itemsPrice * 0.05);
    const totalPrice = round2(itemsPrice + shippingPrice + taxPrice);

    const order = await Order.create({
      user: req.user._id,
      orderItems: normalizedItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
}

export async function getMyOrders(req, res, next) {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
}

export async function getOrderById(req, res, next) {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email");
    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    const isOwner = order.user?._id?.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      res.status(403);
      throw new Error("Not authorized to view this order");
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
}

export async function getAllOrders(req, res, next) {
  try {
    const orders = await Order.find({}).populate("user", "name email").sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
}

export async function payOrder(req, res, next) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    if (order.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      res.status(403);
      throw new Error("Not authorized to pay this order");
    }

    order.isPaid = true;
    order.paidAt = new Date();
    if (order.status === "Processing") {
      order.status = "Shipped";
    }

    const updatedOrder = await order.save();
    res.status(200).json({ success: true, data: updatedOrder });
  } catch (error) {
    next(error);
  }
}

export async function deliverOrder(req, res, next) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    order.isDelivered = true;
    order.deliveredAt = new Date();
    order.status = "Delivered";

    const updatedOrder = await order.save();
    res.status(200).json({ success: true, data: updatedOrder });
  } catch (error) {
    next(error);
  }
}

export async function updateOrderStatus(req, res, next) {
  try {
    const allowedStatus = ["Processing", "Shipped", "Delivered", "Cancelled"];
    const { status } = req.body;

    if (!allowedStatus.includes(status)) {
      res.status(400);
      throw new Error(`status must be one of: ${allowedStatus.join(", ")}`);
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    order.status = status;
    if (status === "Delivered") {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    }

    const updatedOrder = await order.save();
    res.status(200).json({ success: true, data: updatedOrder });
  } catch (error) {
    next(error);
  }
}
