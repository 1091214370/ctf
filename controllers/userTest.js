var multiparty = require('multiparty');
var fs=require('fs');

// 是否登录
exports.signinRequired=function(req,res,next){
	var user=req.session.user;
	if(!user){
		return res.redirect('/login');
	}
	next();
}
// 是否管理员
exports.adminRequired=function(req,res,next){
	var user=req.session.user;
	if(user.role==0){
		return res.redirect('/login');
	}
	next();
}
var fs=require('fs');
var path=require('path');
exports.uploadUserImgPre = function(req, res, next) {
  //生成multiparty对象，并配置上传目标路径
  var user=req.session.user;
  var form = new multiparty.Form({uploadDir: './upload'});
  form.parse(req, function(err, fields, files) {
    var filesTmp = JSON.stringify(files);
 
    if(err){
      console.log('parse error: ' + err);
    } else {
      testJson = eval("(" + filesTmp+ ")"); 
      // console.log(testJson.fileField[0].path);
      // res.json({imgSrc:testJson.fileField[0].path})
      console.log('rename ok');
    }
  });
}

