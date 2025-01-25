import { model, Schema } from "mongoose"




const subscriptionSchema = new Schema( {
    
    channel:{ // whom was subscribed
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    subscriber: { // one who is susbsccribed
        type:Schema.Types.ObjectId,
        ref:"User"
    }


},{timestamps:true})


export const Subscription = model("Subscription", subscriptionSchema)