 var mongoose = require("mongoose");

var commentSchema = mongoose.Schema({
    text: String,
	createdAt:{type:Date, default:Date.now},
    author: {
		id:{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String
	}
   
});

module.exports = mongoose.model("comment", commentSchema);

//red refers to the model that we are goinf=g to refer to with object id
