import express from 'express';
import dotenv from 'dotenv';
import cors from "cors"
import { connectMongoDb } from './connect.js';
import urlRoute from './routes/urls.js';
import URL from "./models/users.models.js"
dotenv.config();

const app = express();

connectMongoDb(process.env.MONGODB)
.then(()=>console.log("Connecting to mongoDb"))

app.use(cors());
app.use(express.json())

app.use('/url',urlRoute);

app.get('/:shortid',async (req,res)=>{
    const shortid=req.params.shortid;
    const isMobile = req.headers["user-agent"].includes("Mobile");
    const entry = await URL.findOneAndUpdate(
      {
        short_id: shortid,
      },
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
        res.status(400).send("URL NOT FOUND")
    }
})

app.listen(process.env.PORT||4000,()=>
   console.log(`Server is listening at port ${process.env.PORT}`)
)
