import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";

function buildAuthResponse(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id),
  };
}

export async function registerUser(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Name, email, and password are required");
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400);
      throw new Error("User already exists");
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: "user",
    });

    res.status(201).json(buildAuthResponse(user));
  } catch (error) {
    next(error);
  }
}

export async function loginUser(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error("Email and password are required");
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    res.status(200).json(buildAuthResponse(user));
  } catch (error) {
    next(error);
  }
}

export async function getMyProfile(req, res, next) {
  try {
    res.status(200).json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      avatar: req.user.avatar,
      address: req.user.address,
      phone: req.user.phone,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateMyProfile(req, res, next) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    if (req.body.email && req.body.email.toLowerCase() !== user.email) {
      const emailTaken = await User.findOne({ email: req.body.email.toLowerCase() });
      if (emailTaken) {
        res.status(400);
        throw new Error("Email already in use");
      }
    }

    user.name = req.body.name ?? user.name;
    user.email = req.body.email ? req.body.email.toLowerCase() : user.email;
    user.avatar = req.body.avatar ?? user.avatar;
    user.phone = req.body.phone ?? user.phone;
    user.address = req.body.address ?? user.address;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    res.status(200).json(buildAuthResponse(updatedUser));
  } catch (error) {
    next(error);
  }
}
