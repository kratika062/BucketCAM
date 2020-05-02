var express=require("express");
var router=express.Router({mergeParams :true});
//merge the params from bucketlist and comments together so that inside comment route we are able to access :id
var list=require("../models/bucketlist");
var comment=require("../models/comment");
var middleware=require("../middleware/index.js")

//=================
//COMMENT ROUTES
//=================

//first is loggenIn will be checked,if loggedin it will call next which will end up seeing comment form
router.get("/new",middleware.isLoggedIn,function(req,res){
	list.findById(req.params.id,function(err,blog){
		if(err){
			console.log(err)
		}else{
			res.render("comments/new",{blog: blog})
		}
	});

});

//isLoggedIn prevents user to add comments unless they're logged in
router.post("/",middleware.isLoggedIn,function(req,res){
	//lookup nucketlist using ID	
	//create new comments
	//connect new comment to campground
	//redirect campground show page

	list.findById(req.params.id,function(err,blog){
		if(err){
			console.log(err);
			res.redirect("bucket/bucketlist")
		}else{
			comment.create(req.body.comment,function(err,comments){
				if(err){
					req.flash("error","SOMETHING WENT WRONG");
					console.log(err);
				}else{
					
					//add username and id to comment
					comments.author.id=req.user._id;
					comments.author.username=req.user.username;
					//save comment
					comments.save();
					blog.comments.push(comments);
					blog.save();req.flash("success","Successfully added comment");
					res.redirect("/bucketlist/"+blog._id);
				}
			})
		}
	});
});

//EDIT COMMENT ROUTES
router.get("/:comment_id/edit",middleware.checkCommentOwnership,function(req,res){
	list.findById(req.params.id,function(err,foundBlog){
		if(err ||!foundBlog){
				 req.flash("error","BucketList not found!");
			return res.redirect("back");
		}else{
		comment.findById(req.params.comment_id,function(err,foundComment){
		if(err){
			res.redirect("back");
		}else{
		res.render("comments/edit",{blog_id:req.params.id, comment:foundComment});		
		}
	})
	
}		
		});
			
	});
	
//UPDATE COMMENT ROUTE 
router.put("/:comment_id",middleware.checkCommentOwnership,function(req,res){
	comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,function(err,UpdatedComment){
		if(err){
			res.redirect("back");
		}else{
			res.redirect("/bucketlist/"+req.params.id);
		}
	})
})

//DELETE/DESTROY COMMENT ROUTE
router.delete("/:comment_id",middleware.checkCommentOwnership,function(req,res){
	comment.findByIdAndRemove(req.params.comment_id,function(err){
		if(err){
			res.redirect("back");
		}else{
			req.flash("success","Comment delte");
			res.redirect("/bucketlist/"+req.params.id);
		}
	});
});


module.exports=router;