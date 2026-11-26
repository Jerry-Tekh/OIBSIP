import mongoose from "mongoose";
const allocation=new mongoose.Schema({inventoryItemId:{type:mongoose.Schema.Types.ObjectId,ref:"InventoryItem",required:true},quantity:{type:Number,required:true,min:0.000001},unit:{type:String,required:true}},{_id:false});
const schema=new mongoose.Schema({orderId:{type:mongoose.Schema.Types.ObjectId,ref:"Order",required:true,unique:true},allocations:{type:[allocation],required:true,validate:value=>value.length>0},status:{type:String,enum:["active","committed","released","expired"],default:"active",index:true},expiresAt:{type:Date,default:null},committedAt:{type:Date,default:null},releasedAt:{type:Date,default:null}},{timestamps:true,versionKey:false});
export default mongoose.model("InventoryReservation",schema);
