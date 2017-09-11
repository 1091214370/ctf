var mongoose = require('mongoose');
var bcrypt=require('bcrypt');
var SALT_WORK_FACTOR=10;
var SightMsgSchema = new mongoose.Schema({
	title:String,
	author:String,
	discribetion:String,
	shangSrc:String,
	xiaSrc:String,
	zuoSrc:String,
	youSrc:String,
	qianSrc:String,
	houSrc:String,
	meta:{
		createAt:{
			type:Date,
			default:Date.now()
		},
		updateAt:{
			type:Date,
			default:Date.now()
		},
	}
});



SightMsgSchema.pre('save',function(next) {
	if(this.isNew) {
		this.meta.createAt = this.meta.updateAt = Date.now();
	}
	else{
		this.meta.updateAt = Date.now();
	}
	next();
});
SightMsgSchema.statics = {
	fetch:function(cb) {
		return this
			.find({})
			.sort('-meta.updateAt')
			.exec(cb)
	},
	findById:function(id,cb) {
		return this
			.findOne({_id:id})
			.exec(cb)
	},
	findByAuthor:function(author,cb) {
		return this
			.find({'author':author})
			.sort('-meta.updateAt')
			.exec(cb)
	}
}
module.exports = SightMsgSchema;