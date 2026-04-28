import mongoose from "mongoose";
const deliveryAssignmentSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
    },
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop",
    },
    shopOrderId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    brodcastedTo: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    status:{
        type:String,
        enum:["brodcasted","accepted","completed"],
        default:"brodcasted"
    },
    notified: {
        type: Boolean,
        default: false
    },
    acceptedAt: { type: Date, default: null }, 
    deliveredAt: { type: Date, default: null }
}, { timestamps: true })

const DeliveryAssignment = mongoose.model("DeliveryAssignment", deliveryAssignmentSchema);
export default DeliveryAssignment;