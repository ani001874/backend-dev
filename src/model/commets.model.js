import { model, Schema } from "mongoose";



const commentsSchema = new Schema( 
    {
        comment: {
            type: String,
            required: true,
            trim: true,
        },
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video",
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
        }

    }
)


export const Comment = model("Comment", commentsSchema);

