var mongoose=require("mongoose"),
    Camp    =require("./models/campground.js"),
    Comment=require("./models/Comment.js");
    
var data=[
    {name:"Local Green Forest",
     image:"https://farm1.staticflickr.com/130/321487195_ff34bde2f5.jpg",
     description:"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum "
    },
    {name:"Ghana Natural Forest",
     image:"https://farm2.staticflickr.com/1086/882244782_d067df2717.jpg",
     description:"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum "
    },
    {name:"Local Camp 2",
     image:"https://farm4.staticflickr.com/3273/2602356334_20fbb23543.jpg",
     description:"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum"
    },
    {name:"Local Lake Camp",
     image:"https://farm6.staticflickr.com/5319/7407436246_0ac54dd559.jpg",
     description:"vaavshuvh suhvuaeiv sdgygdavdav "
    }
 ]
    
 function seedsDB(){
  Camp.remove({},function(err, log){
 if(err){
  console.log(err);
        }else{
  console.log("campground removes");
  data.forEach(function(seed){
   Camp.create(seed,function(err, campground){
    if(err){
     console.log(err);
    }else{
     console.log("added campgrounds");
     Comment.create(
      {
         title:"this is a beautiful place but I wish there was internet",
         author:"Bijay"
      },function(err, comment){
         if(err){
          console.log(err);
         }else{
          campground.comments.push(comment);
          campground.save();
          console.log("comments added");
         }
      }
     
     );
    }
   });
  });
        }
});
 }   


module.exports=seedsDB;