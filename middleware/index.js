// all middleware goes here
var list=require("../models/bucketlist");
var comment=require("../models/comment");
var middlewareObj={};
const util = require("util");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");

middlewareObj.checkBucketlistOwnership=function(req,res,next){
	//if user logged in
	if(req.isAuthenticated()){
		list.findById(req.params.id,function(err,foundBlog){
		//	 if(err ||!foundBlog){           //not found id of bucketlist
				 if(foundBlog.author.id.equals(req.user._id) || req.user.isAdmin){
                   next();
			        }else{
							//req.flash("error","You dont have permission to do that");
				      //does user own the bucketlist
				     if(foundBlog.author.id.equals(req.user._id)){
					   next();
				      }else{
						  req.flash("error","You need to be logged in to do that");
					    res.redirect("back");
					  }	  
					}
		});
}else {
            req.flash("error", "You need to be signed in to do that!");
            res.redirect("/login");
        }
 
}

middlewareObj.checkCommentOwnership=function(req,res,next){
	//if user logged in
	if(req.isAuthenticated()){
		comment.findById(req.params.comment_id,function(err,foundComment){
			 if(err ||!foundComment){
				 req.flash("error","Comment not found!");
				 res.redirect("back")
			        }else{
				      //does user own the comment
				     if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
					   next();
				      }else{
						  req.flash("error","You don't have permission to do that");
					    res.redirect("back");
					  }	  
						
					}
		});
    }else{
		req.flash("error","You need to be logged in to do that");
		res.redirect("back");
	}
 
}

//middleware(we can use it where we want to stop lusing page w/o login)
middlewareObj.isLoggedIn=function (req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	req.flash("success","Please login first");
	res.redirect("/login");   //not loggedin redirect to login form
}


module.exports=middlewareObj;