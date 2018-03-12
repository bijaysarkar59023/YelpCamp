var mongoose=require("mongoose");
var campSchema=new mongoose.Schema({
     name:String,
     price:String,
     image:String,
     description:String,
     author:{id:{
             type:mongoose.Schema.Types.ObjectId,
             ref:"User"
                },Username:String,
     },
     comments:[{
           type:mongoose.Schema.Types.ObjectId,
           ref:"Comment"
     }]
     });
     
     module.exports=mongoose.model("Camp",campSchema);
     