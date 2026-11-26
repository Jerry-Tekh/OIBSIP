import mongoose from "mongoose";
const schema=new mongoose.Schema({
 name:{type:String,required:true,trim:true,maxlength:100},slug:{type:String,required:true,lowercase:true,trim:true,unique:true},
 category:{type:String,required:true,enum:["base","sauce","cheese","vegetable"]},
 description:{type:String,trim:true,maxlength:500,default:""},priceContributionMinor:{type:Number,required:true,min:0},
 currency:{type:String,required:true,enum:["NGN"],default:"NGN"},imageUrl:{type:String,trim:true,default:null},
 isAvailable:{type:Boolean,default:true},isPublished:{type:Boolean,default:false},
 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true}
},{timestamps:true,versionKey:false});
schema.index({category:1,isPublished:1,isAvailable:1});
export default mongoose.model("PizzaOption",schema);
