import { model, Schema } from "mongoose";



const videoSchema = new Schema({
    videoFile: {
        type:String, //cloudinary url
        required:true
    },
    thumbnail: {
        type:String, //cloudinary url
        required:true
    },
    title: {
        type:String,

    },
    title: {
        type: String, 
        required: true
    },
    description: {
        type: String, 
        required: true
    },
    duration: {
        type: Number, 
        required: true
    },
    views: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }

},{timestamps:true})


const Video = model("Video", videoSchema)

export default Video