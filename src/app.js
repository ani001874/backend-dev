import express from "express";
import cookieParser from "cookie-parser";
import cors from 'cors'

const app = express();
app.use(cors({origin:process.env.ALLOWED_ORIGINS}))
app.use(express.json({ limit: "30kb" }));
app.use(express.urlencoded({ limit: "100kb", extended: true }));
app.use(express.static("public"))
app.use(cookieParser)
export default app;
