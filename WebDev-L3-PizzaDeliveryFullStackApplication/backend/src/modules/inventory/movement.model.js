import mongoose from "mongoose";
const schema=new mongoose.Schema({
 inventoryItemId:{type:mongoose.Schema.Types.ObjectId,ref:"InventoryItem",required:true,index:true},
 movementType:{type:String,enum:["initial_stock","restock","waste","correction","reservation","consumption","release"],required:true},
 direction:{type:String,enum:["in","out"],required:true},quantity:{type:Number,required:true,min:0.000001},unit:{type:String,required:true},
 physicalStockBefore:{type:Number,required:true,min:0},physicalStockAfter:{type:Number,required:true,min:0},
 reason:{type:String,required:true,trim:true,maxlength:300},referenceType:{type:String,enum:["manual","order","reservation","system"],default:"manual"},
 referenceId:{type:mongoose.Schema.Types.ObjectId,default:null},actorUserId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true}
},{timestamps:true,versionKey:false});
schema.index({inventoryItemId:1,createdAt:-1});schema.index({actorUserId:1,createdAt:-1});
export default mongoose.model("InventoryMovement",schema);
