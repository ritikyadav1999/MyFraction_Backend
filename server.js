const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const arena = require("./config/arena");
const connectDB = require("./config/db");
var cors = require("cors");
const {startSubscriber} = require("./config/subscribe")

require("dotenv").config();
require("./config/passport");

const app = express();

// ✅ Connect to MongoDB
connectDB();

// ✅ Start Blockchain subscriber
startSubscriber();

// ✅ Middleware (Load Before Routes)
app.use(
  cors({
    origin: "http://localhost:4200", // Frontend URL
    credentials: true, // Allow cookies
  })
);
app.use(express.json());
app.use(cookieParser());

// ✅ Add session middleware (Required for OAuth)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your_session_secret",
    resave: false,
    saveUninitialized: false,
  })
);

// ✅ Initialize Passport
app.use(passport.initialize());
app.use(passport.session()); // Required for OAuth

// ✅ Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/admin", require("./routes/retryJobs"));
app.use("/api/user", require("./routes/user")); // Protected Routes
app.use("/api/property", require("./routes/property"));
app.use("/api/investment", require("./routes/investment"));
app.use("/api/dashboard",require("./routes/dashboard"))

// ✅ Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
