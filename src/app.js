import express from "express";
import cookieParser from "cookie-parser";
import cors from 'cors'

const app = express();
app.use(cors({origin:process.env.ALLOWED_ORIGINS}))
app.use(express.json({ limit: "30kb" }));
app.use(express.urlencoded({ limit: "100kb", extended: true }));
app.use(express.static("public"))
app.use(cookieParser())



// routes import 

import userRouter from './router/user.routes.js'
import videoRouter from "./router/video.routes.js";
import subscriptionRouter from "./router/subscription.routes.js";



app.use('/api/v1/users',userRouter)
app.use('/api/v1/videos', videoRouter)
app.use('/api/v1/subscriptions', subscriptionRouter)


export default app;
