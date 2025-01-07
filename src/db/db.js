import mongoose from "mongoose"
import { DB_NAME } from "../constant.js"



const connectDb = async () => {
    try {
        const connectionObj = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
        console.log(connectionObj.connection.host)
    } catch (error) {
        console.log("MONGO Connection Error: ", error)
        throw error
    }
}

export default connectDb