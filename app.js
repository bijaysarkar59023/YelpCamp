var express=require("express");
var app=express();
var passport = require("passport");
var LocalStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
var mongoose=require("mongoose");
var methodOverride= require("method-override");
var User = require("./models/user.js");
var Camp=require("./models/campground.js");
var seedsDB=require("./seeds.js");
var  Comment=require("./models/Comment.js");
var flash = require("connect-flash");


mongoose.connect("mongodb://localhost/yelp_camp",{ useMongoClient: true });
app.set("view engine","ejs");
var bodyParser=require("body-parser");
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(flash());
app.use(express.static("public"));
//passport configaration 

app.use(require("express-session")({
 secret:"I Am The Best",
 resave:false,
  saveUninitialized:false
}));


app.use(passport.initialize());
app.use(passport.session());
app.use(function(req,res,next){
 res.locals.currentUser=req.user;
 res.locals.error=req.flash("error");
 res.locals.success=req.flash("success");
 next();
});
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




// seedsDB();
app.get("/",function(req,res){
res.render("landing")
});

app.get("/campgrounds/admin",function(req,res){
res.render("adminregister");
});


app.get("/campgrounds",function(req,res){
Camp.find({},function(err,allCampgrounds){
if(err){
console.log(err);
}else{
res.render("campgrounds",{campgrouds:allCampgrounds});
}
});
});

app.get("/campgrounds/new",isLoggedIn ,function(req, res) {
res.render("newcampgrounds");
});

app.post("/campgrounds",isLoggedIn ,function(req,res){
var name=req.body.name;
var price=req.body.price;
var image=req.body.image;
var desc=req.body.desc;
console.log(req.user);
var author={id:req.user._id,Username:req.user.username};
var post={name: name,price:price,image: image,description: desc,author: author};
Camp.create(post,function(err, newcamp){
if(err){
console.log(err);
}else{
res.redirect("/campgrounds");
}
});
});

app.get("/campgrounds/:id",function(req, res){
 Camp.findById(req.params.id).populate("comments").exec(function(err,singlecamp){
  if(err || !singlecamp){
   req.flash("error","Campground not found");
   res.redirect("/campgrounds")
  }else{
   res.render("singlecamp",{campground:singlecamp});
   console.log(singlecamp);
  }
 });
});

//comments  new
app.get("/campgrounds/:id/comments/new",isLoggedIn ,function(req, res){
    Camp.findById(req.params.id,function(err, campground){
     if(err){
        console.log(err);
     }else{
      res.render("newcomment",{campground:campground});
     }         }
)}
);

//comments create
app.post("/campgrounds/:id/comment", isLoggedIn ,function(req, res){
   Camp.findById(req.params.id,function(err, campground){
     if(err){
      console.log(err);
     }else{
      Comment.create(req.body.comment,function(err, comment){
       if(err){
        console.log(err);
       }else{
        comment.author.id=req.user._id;
        comment.author.username=req.user.username;
        comment.save();
        campground.comments.push(comment);
        campground.save();
        res.redirect("/campgrounds/"+campground._id);
       }
      });
     }
   });
});
//comment edit route
app.get("/campgrounds/:id/comment/:comment_id/edit",CheckCommentOwnership,function(req,res){
   Comment.findById(req.params.comment_id,function(err, findcomment){
    if(err){
     res.redirect("back");
    }else{
     console.log("userName:"+findcomment.author.username);
     console.log("userName:"+findcomment.author.id);
     res.render("commentedit",{campground_id:req.params.id,comment:findcomment});
    }
   });
});

app.put("/campgrounds/:id/comment/:comment_id",CheckCommentOwnership,function(req, res){
 Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,function(err, updatecomment){
  if(err){
   res.redirect("back");
  }else{
   res.redirect("/campgrounds/"+ req.params.id);
  }
 });
});

//comment Delete route
app.delete("/campgrounds/:id/comment/:comment_id", CheckCommentOwnership,function(req, res){
 Comment.findByIdAndRemove(req.params.comment_id,function(err){
  if(err){
   res.redirect("back")
  }res.redirect("/campgrounds/"+ req.params.id);
 });
});

// Check CommentOwnership
function CheckCommentOwnership(req,res,next){
 if(req.isAuthenticated()){
   Comment.findById(req.params.comment_id,function(err, comment){
    if(err){
     console.log(err);
    }else{
      if(comment.author.id.equals(req.user._id) || req.user.isAdmin){
       next();
      }else{
       res.redirect("back");
      }
    }
   });
 }else{
  res.redirect("back");
 }
}


//REGISTER ROUTE
app.get("/register",function(req, res){
 res.render("register");
});

app.post("/register",function(req, res){
 var newUser=new User({username:req.body.username,email:req.body.email});
 if(req.body.adminCode==="secretCode123"){
  newUser.isAdmin=true;
 }
 User.register(newUser,req.body.password,function(err, user){
  if(err){
   req.flash("error", err.message);
   return res.redirect("back");
  }else{
   passport.authenticate("local")(req, res,function(){
    req.flash("success","Welcome to YelpCamp " +  user.username)
    res.redirect("/campgrounds");
   });
  }
 });
});

//login route

app.get("/login",function(req, res) {
    res.render("login");
});

app.post("/login",passport.authenticate("local",{
    successRedirect:"/campgrounds",
    failureRedirect:"/login"
    
}),function(req, res){

});

//logout route

app.get("/logout",function(req, res) {
    req.logout();
    req.flash("success","Logged you out")
    res.redirect("/campgrounds");
});

//MIDDLEWARE
function isLoggedIn(req,res,next){
 if(req.isAuthenticated()){
  return next();
 }req.flash("error","you have to logged in to do that");
 res.redirect("/login");
}


//EDIT CAMPGROUNDS

app.get("/campgrounds/:id/edit",CheckCampgroundOwnership,function(req,res){
         Camp.findById(req.params.id,function(err,findcamp){
          if(err){
           console.log(err);
          }else
          res.render("editcamppahe",{findcamps:findcamp});
         });  
    });


app.put("/campgrounds/:id",CheckCampgroundOwnership,function(req, res){
 Camp.findByIdAndUpdate(req.params.id, req.body.camp, function(err, updatecamp){
  if(err){
   console.log(err);
  }else{
   res.redirect("/campgrounds/"+ req.params.id);
   console.log(req.body.findcamp);
  }
 });
});

app.delete("/campgrounds/:id",CheckCampgroundOwnership,function(req, res){
 Camp.findByIdAndRemove(req.params.id,function(err){
   if(err){
    console.log(err);
   }
   res.redirect("/campgrounds");
 });
});

//Check CampgroundOwnership

function CheckCampgroundOwnership(req,res,next){
 if(req.isAuthenticated()){
   Camp.findById(req.params.id,function(err, findcamp){
    if(err){
     console.log(err);
    }else{
      if(findcamp.author.id.equals(req.user._id) || req.user.isAdmin){
       next();
      }else{
       res.redirect("back");
      }
    }
   });
 }else{
  res.redirect("back");
 }
}



 



app.listen(process.env.PORT,process.env.IP,function(){
console.log("YelpVamp server has started");
});

