var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Campground = require("../models/bucketlist");
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");

router.get("/",function(req,res){
	res.render("landing")
});

//AUTH ROUTES

//show register form
router.get("/register",function(req,res){
	res.render("bucket/register");
});

//handle sign up logic
router.post("/register" ,function(req,res){
	
   
	var newUser=new User({username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,});  //username from form
	
    if(req.body.adminCode === 'Kratika@123') {
      newUser.isAdmin = true;
    }
	
	User.register(newUser,req.body.password,function(err,user){
		if(err){
			console.log(err);  //this error be like pass or username empty,username already taken...
			return res.render("bucket/register",{error:err.message});
		}else{
			passport.authenticate("local")(req,res,function(){    //pass from form
				req.flash("success","Welcome to BucketCAM "+user.username);
				res.redirect("/bucketlist");
			});
		}
     });
});

//show login from
router.get("/login",function(req,res){
	res.render("bucket/login");
});

//handling login logic
//app.post("/login",middleware,callback)
router.post("/login",passport.authenticate("local", 
  { 
     successRedirect :"/bucketlist",
     failureRedirect :"/login",
	 failureFlash: true,
     successFlash: 'Welcome to BucketCam!'
  }),function(req,res){
	
});

// logout logic 
router.get("/logout",function(req,res){
	req.logout();
	req.flash("error","Logged you out!");
	res.redirect("/bucketlist");
});



module.exports=router;