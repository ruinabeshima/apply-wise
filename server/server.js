const express = require("express");
const app = express();
const cors = require("cors");
const { clerkMiddleware } = require("@clerk/express");

require("dotenv").config();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  }),
);
app.use(clerkMiddleware());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Hello World" });
});

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
