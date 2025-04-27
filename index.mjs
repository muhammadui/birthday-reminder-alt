import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import ejsLayouts from "express-ejs-layouts";
import flash from "connect-flash";
import session from "express-session";
import routes from "./routes/userRoutes.mjs";

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Get directory name
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {})
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(`MongoDB connection error: ${err.message}`));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET || "birthday-app-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60 * 60 * 1000 }, // 1 hour
  })
);

// Flash messages
app.use(flash());
app.use((req, res, next) => {
  res.locals.messages = req.flash();
  next();
});

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(ejsLayouts);
app.set("layout", "layout");

// Routes
app.use("/", routes);

// Error handling middleware
app.use((req, res, next) => {
  res.status(404).render("404", { title: "Page Not Found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("error", {
    title: "Error",
    error:
      process.env.NODE_ENV === "production"
        ? "Something went wrong"
        : err.message,
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
