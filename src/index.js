import app from "./app.js";
import connectDb from "./db/db.js";
import dotenv from "dotenv";

dotenv.config({
    path: ".env",
});

connectDb()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log("** server is running....");
        })
    })
    .catch((err) => {
        console.log("MongoDb connection failed!!!");
    })
