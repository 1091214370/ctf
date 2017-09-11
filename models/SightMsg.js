//模型
var mongoose=require('mongoose');
var SightMsgSchema=require('../schemas/SightMsg');
var SightMsg=mongoose.model('SightMsg',SightMsgSchema);

module.exports=SightMsg;