require('dotenv').config({ path: 'process.env'});

var mongoose         =require("mongoose"),
    methodOverride   =require("method-override"),
	expressSanitizer =require("express-sanitizer"),
	express          =require("express"),
    app              =express(),
	flash            =require("connect-flash"),
	comment          =require("./models/comment"),
	list             =require("./models/bucketlist"),
	bodyParser       =require("body-parser"),
	seedDB           =require("./seed"),
	
	passport         =require("passport"),
	LocalStrategy    =require("passport-local"),
	User             =require("./models/user");

const multer = require('multer');
const path = require('path');
	
app.locals.moment=require("moment");
//requiring routes
var commentRoutes    =require("./routes/comments"),
	bucketlistRoutes =require("./routes/bucketlist"),
	authRoutes       =require("./routes/auth"),
	 userRoute       = require("./routes/user"),
	passwordRoute   = require("./routes/password");
// APP CONFIG
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

var url=process.env.DATABASEURL || "mongosb://localhost/bucketList"
mongoose.connect(url);

app.set("view engine","ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded ({extended : true})); 
app.use(expressSanitizer()); //after bodyParser
app.use(methodOverride("_method"));     //what it will look in url i.e _method
const upload = multer({dest: __dirname + '/uploads/images'});
app.use(flash());
//seedDB();   //seed the DB

//PASSPORT CONFIG
app.use (require("express-session")({
	secret: "Bucketlist is a good website",
	resave :false,
	saveUninitialized :false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//middleware-whatever function we provide to it will be called on every route(runrun on every single route)
app.use(function(req,res,next){
	
	res.locals.currentUser=req.user;
	res.locals.error=req.flash("error");
	res.locals.success=req.flash("success");
	next();    
})


//whatever we put in res.locals is what available inside our every template(.ejs)	
//we need to have next in order to move that to next middleware whichis actually be route handler i.e function inmostcase
//req.user => it is empty if no one signed in or will contain username and id of current user who is loggedin.

app.use("/",authRoutes);
app.use("/bucketlist",bucketlistRoutes);  //it takes bucketlistRoutes and it appends /campgrounds infront of them
app.use("/bucketlist/:id/comments",commentRoutes);
app.use("/users", userRoute);
app.use("/", passwordRoute);

app.listen(process.env.PORT ||3000,function(){
	console.log("server has started")
});
