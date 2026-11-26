import mongoose from "mongoose";
const ingredient=new mongoose.Schema({inventoryItemId:{type:mongoose.Schema.Types.ObjectId,ref:"InventoryItem",required:true},quantityRequired:{type:Number,required:true,min:0.000001},unit:{type:String,required:true}},{_id:false});
const schema=new mongoose.Schema({productId:{type:mongoose.Schema.Types.ObjectId,required:true,unique:true,index:true},productNameSnapshot:{type:String,required:true,trim:true,maxlength:120},ingredients:{type:[ingredient],required:true,validate:value=>value.length>0},version:{type:Number,default:1,min:1},isActive:{type:Boolean,default:true},notes:{type:String,trim:true,maxlength:500,default:""},createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true}},{timestamps:true,versionKey:false});
schema.index({productNameSnapshot:1});
export default mongoose.model("Recipe",schema);
