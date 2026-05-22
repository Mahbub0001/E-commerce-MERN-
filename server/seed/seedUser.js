import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";

dotenv.config();

const adminUser = {
  name: "Admin User",
  email: "admin@gmail.com",
  password: "admin123",
  role: "admin",
};

async function seedAdmin() {
  try {
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminUser.email });
    if (existingAdmin) {
      console.log("Admin user already exists");
      process.exit(0);
    }

    // Create admin user
    await User.create(adminUser);
    console.log("Admin user created successfully");
    console.log(`Email: ${adminUser.email}`);
    console.log(`Password: ${adminUser.password}`);
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
}

seedAdmin();
