import app from "./app.js";
import connectDb from "./db/db.js";
import dotenv from "dotenv";

dotenv.config({
    path: ".env",
});






connectDb()
    .then(() => {
        app.listen(8000, () => {
            console.log("** server is running on port:8000");
        })
    })
    .catch((err) => {
        console.log("MongoDb connection failed!!!");
    })
