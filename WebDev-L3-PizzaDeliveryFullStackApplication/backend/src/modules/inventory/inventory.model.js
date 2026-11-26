import mongoose from "mongoose";
const inventoryItemSchema = new mongoose.Schema({
 name:{type:String,required:true,trim:true,maxlength:100}, normalizedName:{type:String,required:true,unique:true,lowercase:true,trim:true},
 sku:{type:String,trim:true,uppercase:true,maxlength:40,sparse:true,unique:true}, category:{type:String,required:true,trim:true,maxlength:60},
 unit:{type:String,required:true,enum:["g","kg","ml","l","piece","bunch","pack","portion"]},
 physicalStock:{type:Number,required:true,min:0,default:0}, reservedStock:{type:Number,required:true,min:0,default:0},
 lowStockThreshold:{type:Number,required:true,min:0,default:0}, isActive:{type:Boolean,default:true},
 notes:{type:String,trim:true,maxlength:500,default:""}, createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
 updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true}
},{timestamps:true,versionKey:false});
inventoryItemSchema.index({category:1,isActive:1}); inventoryItemSchema.index({name:"text",sku:"text"});
inventoryItemSchema.virtual("availableStock").get(function(){return this.physicalStock-this.reservedStock;});
export default mongoose.model("InventoryItem",inventoryItemSchema);
