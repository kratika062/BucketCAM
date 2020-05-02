  
var mongoose = require("mongoose");


var bucketlistSchema = new mongoose.Schema({
 	name:String, 
    image:String, //{type:String ,default:"img.png"} when user will not give img default img will be set
	created:{type:Date, default:Date.now},
   Description:String,
	
	author:{
	id:{
		type: mongoose.Schema.Types.ObjectId,
		ref:"User"
      },
	    username:String
	},
comments: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "comment"
      }
   ],
	likes: [
		{
			
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
       
    
		}
	],
	
       
});

module.exports = mongoose.model("list", bucketlistSchema);