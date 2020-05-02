require('dotenv').config({ path: 'process.env'});
var express=require("express");
var router=express.Router();
var list=require("../models/bucketlist")
var middleware=require("../middleware/index.js");
var multer = require('multer');
var User=require("../models/user");

var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: "dkr8uvq04", 
   api_key: process.env.CLOUDINARY_API_KEY, 
   api_secret: process.env.CLOUDINARY_API_SECRET
});

var arr=[
	{
		quote:"“Broad, wholesome, charitable views of men and things cannot be acquired by vegetating in one little                     corner of the earth all of one’s lifetime.” ",
		author: "Mark Twain"
		
	},
	{
		quote:"“Broad, wholesome, charitable views of men and things cannot be acquired by vegetating in one little                     corner of the earth all of one’s lifetime.” ",
		author: "Mark Twain"
	},
	{
		quote:"“In the end, it’s not the years in your life that count. It’s the life in your years.” ",
		author: "Abraham Lincoln"
	},
	{
		quote:"“I don’t want to get to the end of my life and find that I lived just the length of it. I want to have   lived the width of it as well”",
		author: "Diane Ackerman"
	},
	{
		quote:"“Fill your life with tiny and large adventurous moments.” ",
		author:"  Sark"
	}
	
]
var randomItem = arr[Math.floor(Math.random()*(arr.length))];
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

//INDEX - show all campgrounds
router.get("/", function(req, res){
    var noMatch = null;
    var perPage = 8;
    var pageQuery = parseInt(req.query.page);
    var pageNumber = pageQuery ? pageQuery : 1;
	if(req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        // Get all campgrounds from DB
        list.find({name: regex}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allBlogs) {
            list.count({name: regex}).exec(function (err, count) {
            
           if(err){
               console.log(err);
           } else {
              if(allBlogs.length < 1) {
                  noMatch = "No bucketlist match that query, please try again.";
              }
              res.render("bucket/bucketlist",
						 {bucketlist:allBlogs,
					    current: pageNumber,
                        pages: Math.ceil(count / perPage),
                        noMatch: noMatch,
						 randomItem:randomItem,
                        search: req.query.search});
           }
        });
		});
    } else {
    
    list.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allBlogs) {
        list.count().exec(function (err, count) {
            if (err) {
                console.log(err);
            } else {
				
                res.render("bucket/bucketlist", {
                    bucketlist: allBlogs,
                    current: pageNumber,
                    pages: Math.ceil(count / perPage),
					noMatch: noMatch,
					randomItem:randomItem,
                        search: false
                });
            }
        });
    });
}
});		
   
//NEW ROUTE-show form to create new bucketlist
router.get("/new",middleware.isLoggedIn,function(req,res){
	res.render("bucket/new");
});


	router.post("/",middleware.isLoggedIn,upload.single('image'),function(req,res){
		
		cloudinary.uploader.upload(req.file.path, function(result) {
  // add cloudinary url for the image to the bucketlist object under image property
  req.body.blog.image = result.secure_url;
  // add author to bucketlist
  req.body.blog.author = {
    id: req.user._id,
    username: req.user.username
  }
  list.create(req.body.blog, function(err, newBlog) {
    if (err) {
      req.flash('error', err.message);
      return res.redirect('back');
    }
    res.redirect('/bucketlist/' + newBlog.id);
  });
});
	
});

//travel
router.get("/travel",function(req,res){
	res.render("categories/travel")
});
//new skill
router.get("/newSkill",function(req,res){
	res.render("categories/newSkill")
});
//entertainment
router.get("/entertainment",function(req,res){
	res.render("categories/entertain")
});
//adventure sports
router.get("/adventureSports",function(req,res){
	res.render("categories/adventure")
});
//hiking
router.get("/hiking",function(req,res){
	res.render("categories/hiking")
});
//nature
router.get("/nature",function(req,res){
	res.render("categories/nature")
});


//SHOW ROUTE-show info more about one bucketlist
router.get("/:id",function(req,res){
	list.findById(req.params.id).populate("comments").populate("likes").exec(function(err,foundBlog){
		console.log(foundBlog);
		if (err || !foundBlog){
		 req.flash("error","bucketlist not found!");
			res.redirect("/bucketlist");
		}
		else{
			res.render("bucket/show",{blog:foundBlog});
		}
	})
})
//EDIT ROUTE
router.get("/:id/edit",middleware.checkBucketlistOwnership,function(req,res){
	list.findById(req.params.id,function(err,foundBlog){
		if(err){
			req.flash("error","BUCKETLIST DOESNT EXIST");
			res.redirect("bucket/bucketlist");
		}else{

			res.render("bucket/edit",{blog: foundBlog});
		}
	})
})

//UPDATE ROUTE
router.put("/:id",middleware.checkBucketlistOwnership,function(req,res){
	req.body.blog.body=req.sanitize(req.body.blog.body);
	list.findByIdAndUpdate(req.params.id,req.body.blog,function(err,updatedBlog){
	if(err){
		req.flash("error","BUCKETLIST DOESNT EXIST");
		res.render("bucket/bucketlist")
	}	else{
		res.redirect("/bucketlist/"+req.params.id);
	}	
	});
});
//DELETE ROUTE
router.delete("/:id",middleware.checkBucketlistOwnership,function(req,res){
	//destroy bucketlist
	list.findByIdAndRemove(req.params.id ,function(err){
		if(err){
			res.redirect("/bucketlist");
		}else{
			req.flash("succes","bucketlist deleted successfully");
			//redirect somewhere
			res.redirect("/bucketlist")
		}
	})
	
});

// Campground Like Route
router.post("/:id/like", middleware.isLoggedIn, function (req, res) {
    list.findById(req.params.id, function (err, foundBlog) {
        if (err) {
            console.log(err);
            return res.redirect("/bucketlist");
        }

        // check if req.user._id exists in foundCampground.likes
        var foundUserLike = foundBlog.likes.some(function (like) {
            return like.equals(req.user._id);
        });

        if (foundUserLike) {
            // user already liked, removing like
            foundBlog.likes.pull(req.user._id);
        } else {
            // adding the new user like
            foundBlog.likes.push(req.user);
        }

        foundBlog.save(function (err) {
            if (err) {
                console.log(err);
                return res.redirect("/bucketlist");
            }
			console.log(foundBlog);
			console.log("hhhhhhhhhhh"+foundBlog.likes.length);
            return res.redirect("/bucketlist/" + foundBlog._id);
        });
    });
});

//user profile
 
 router.get("/:username/profile", function(req,res){
    User.findOne({username: req.params.username}, function(err,foundUser){
        if(err){
            req.flash("error", "Something went wrong.");
            return res.redirect("/");
        }
        res.render('bucket/profile',{user:foundUser});
    })
});


module.exports=router;



