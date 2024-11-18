import express from 'express';
import dotenv from 'dotenv';
import cors from "cors";
import mongoose from "mongoose";
import URL from "./models/users.models.js"; // Your URL model
import urlRoute from './routes/urls.js'; // Your URL routes

dotenv.config();

// MongoDB connection
async function connectMongoDb(url) {
  try {
    await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}

const app = express();

// Connect to MongoDB
connectMongoDb(process.env.MONGODB);

// Middleware setup
app.use(cors());
app.use(express.json());

// URL routes
app.use('/url', urlRoute);

// Redirect route based on short id
app.get('/:shortid', async (req, res) => {
  const shortid = req.params.shortid;
  const isMobile = req.headers["user-agent"].includes("Mobile");

  try {
    const entry = await URL.findOneAndUpdate(
      { short_id: shortid },
      {
        $push: {
          visitedHistory: {
            timestamp: Date.now(),
            source: isMobile ? "qr_scan" : "web_click",
          },
        },
      },
      { new: true }
    );

    if (entry) {
      res.redirect(entry.redirected_url);
    } else {
      res.status(400).send("URL NOT FOUND");
    }
  } catch (error) {
    console.error("Error redirecting:", error);
    res.status(500).send("Server error");
  }
});

// Start the server
app.listen(process.env.PORT || 4000, () => {
  console.log(`Server is listening on port ${process.env.PORT || 4000}`);
});
