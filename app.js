var express= require('express');
var captchapng = require('captchapng');
var path =require('path');
var SightMsg=require('./models/SightMsg');
var User=require('./models/user');
var UserTest=require('./controllers/userTest');
var _=require('underscore');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var mongoose=require('mongoose');
var formidable = require('formidable');
var multiparty = require('multiparty');
var fs=require('fs');


var port =process.env.PORT||3000;
var bodyParser = require('body-parser');   
var app =express();
var dbUrl='mongodb://127.0.0.1:27017/ctf';


mongoose.connect(dbUrl);
mongoose.Promise = global.Promise;
app.set('views','./view/page');
app.set("view cache",true);
app.set('view engine','ejs');
app.use(cookieParser());
app.use(cookieSession({
	secret:'ctf',
	maxAge: 2*60*60 * 1000 // 2hours
}));


app.use(bodyParser.json());// 格式化表单提交
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static((path.join(__dirname,'public'))));
console.log('server run on port'+port);
app.locals.moment=require('moment');
app.listen(port);





//
app.use(function(req,res,next){
	var _user=req.session.user;
	if(_user){
		res.locals.user=_user;
	}
	return next();
});
//验证码
app.get('/verify',function(req, res, next) {
	var code = parseInt(Math.random() * 9000 + 1000);
	req.session.checkcode = code;
	var p = new captchapng(120, 42, code);
	p.color(0, 0, 0, 0);
	p.color(80, 80, 80, 255);
	var img = p.getBase64();
	var imgbase64 = new Buffer(img, 'base64');
	res.writeHead(200, {
		'Content-Type': 'image/png'
	});
	res.end(imgbase64);

});
// 首页
app.get('/',function(req,res){
	res.render('index');
});
// 列表页
app.get('/list',function(req,res){
	SightMsg.fetch(
		function(err,SightMsgs){
			if(err){
				console.log(err);
			}
			res.render('blank',{title:"作品列表--基于WEBGL的3D场景实现",'SightMsgs':SightMsgs});
		});
});
//使用教程
app.get('/teach',function(req,res){
	res.render('teach',{title:"使用教程--基于WEBGL的3D场景实现"});
});
// 详情页
app.get('/items/:id',function(req,res){
	var id=req.params.id;
	SightMsg.findById({_id:id},function(err,sight){
		if(err){
				console.log(err);
			}
		res.render('layout',{title:sight.title,'discribetion':sight.discribetion,'authorName':sight.author,'time':sight.meta.updateAt,'shangSrc':sight.shangSrc,'xiaSrc':sight.xiaSrc,'zuoSrc':sight.zuoSrc,'youSrc':sight.youSrc,'qianSrc':sight.qianSrc,'houSrc':sight.houSrc});
	});
});
// 示例1
app.get('/demos/item1',function(req,res){
	res.render('item1',{title:"公园实景--基于WEBGL的3D场景实现",id:"1"});
});

// 示例2
app.get('/demos/item2',function(req,res){
	res.render('item2',{title:"校园操场实景--基于WEBGL的3D场景实现","id":"2"});
});





// 登录
app.get('/login',function(req,res){
	res.render('login',{title:"登录--基于WEBGL的3D场景实现"});
});
app.post('/user/login',function(req,res){
	var _user=req.body.user;
	var name=_user.name;
	var password=_user.password;
	var code=_user.code;
	if(code==req.session.checkcode){
		User.findOne({name:name},function(err,user){
			if(err){
				console.log(err);
			}
			if(!user){
				return res.send({'code':'2','msg':'用户不存在'});
			}
			user.comparePassword(password,function(err,isMatch){
				if(err){
					console.log(err);
				}

				if(isMatch){
					req.session.user=user;
					if(user.role==8784){
						return res.send({'code':'1','msg':'/admins/superAdmin/'+name});
					}else{
						return res.send({'code':'1','msg':'/admins/userAdmin/'+name});
					}

				}else{
					return res.send({'code':'4','msg':'密码错误'});
				}
			})
		});
	}else{
		res.send({'code':'3','msg':'验证码输入错误'});
	}
	
});
// 退出
app.get('/logout' ,function(req, res) {
	delete req.session.user;
	delete res.locals.user;
	res.redirect('/')
});
//注册
app.get('/signup',function(req,res){
	res.render('signup',{title:"注册--基于WEBGL的3D场景实现"});
});
app.post('/user/signup',function(req,res){
	var _user=req.body.user;
	var code=_user.code;
	if(code==req.session.checkcode){
		User.findOne({name:_user.name},function(err,user){
			if(err){
				console.log(err)
			}
			if(user){
				res.send({'code':'2','msg':'用户名已存在'});;
			}else{
				var user=new User(_user);

				user.save(function(err,user){
					if(err){
						console.log(err)
					}
					res.send({'code':'1','msg':'注册成功'});
				});
			}
		});
	}else{
		res.send({'code':'3','msg':'验证码输入错误'});
	}
	

})
//上传页面
app.get('/creat3D',UserTest.signinRequired,function(req,res){

	res.render('design',{title:"场景资料上传--基于WEBGL的3D场景实现"});
});
// 数据、图片上传处理
app.post('/user/upload', function(req, res, next) {
	var shangPath,xiaPath,zuoPath,youPath,qianPath,houPath;
	var form = formidable.IncomingForm();  
		form.encoding = 'utf-8';  
		form.uploadDir = './public/upload/';
		form.keepExtensions = true;  
  		form.maxFieldsSize = 2 * 1024 * 1024; // 单位为byte  
  		form.on('end', function() {  
  		});  
  		form.on('error', function(err) {  
  			console.error('上传失败：', err.message);  
  			next(err);  
  		})  
  		form.parse(req,function(err,filed,files){
  			if(err){
  				console.log("获取路径错误" +err);
  			}
  			shangPath ='/upload/'+ files.shang.path.substring(14);
  			xiaPath ='/upload/'+  files.xia.path.substring(14);
  			zuoPath = '/upload/'+ files.zuo.path.substring(14);
  			youPath = '/upload/'+ files.you.path.substring(14);
  			qianPath = '/upload/'+ files.qian.path.substring(14);
  			houPath = '/upload/'+ files.hou.path.substring(14);
  			res.send({'code':'1','msg':[shangPath,xiaPath,zuoPath,youPath,qianPath,houPath]});
  		});
});  
// 场景数据保存
app.post('/user/upload/save',function(req,res,next){
	var authorName,title,discribetion,shangPath,xiaPath,zuoPath,youPath,qianPath,houPath;
	if(req.session.user){
		authorName=req.session.user.name;
	}else{
		res.redirect('/login');
		return;
	}
	
	title=req.body.title;
	discribetion=req.body.discribetion;
	shangPath=req.body.shang;
	xiaPath=req.body.xia;
	zuoPath=req.body.zuo;
	youPath=req.body.you;
	qianPath=req.body.qian;
	houPath=req.body.hou;
	_SightMsg = new SightMsg({
				'title':title,
				'discribetion':discribetion,
      			'author':authorName,
      			'shangSrc':shangPath,
      			'xiaSrc':xiaPath,
      			'zuoSrc':zuoPath,
      			'youSrc':youPath,
      			'qianSrc':qianPath,
      			'houSrc':houPath,
   			});  
    _SightMsg.save(function(err,SightMsg) {
      	if(err){
        	console.log(err);
     	}
    })
    res.send({'code':'1','msg':'/items/'+_SightMsg._id});
});
// 在线裁剪
app.get('/cutonline',UserTest.signinRequired,function(req,res){
	 res.render('cutonline',{title:"在线裁剪页面"});
});

//用户管理页面
app.get('/admins/userAdmin/:name',UserTest.signinRequired,function(req,res){
	var authorName=req.params.name;
	SightMsg.findByAuthor(authorName,function(err,SightMsgs){
		if(err){
			console.log(err);
		}
		res.render('userAdmin',{title:"用户管理页面--基于WEBGL的3D场景实现",'SightMsgs':SightMsgs});
	});
});
//系统管理页面
app.get('/admins/superAdmin/:name',UserTest.signinRequired,UserTest.adminRequired,function(req,res){
	var id=req.params.id;
	SightMsg.fetch(
		function(err,SightMsgs){
			if(err){
				console.log(err);
			}
			User.fetch(
				function(err,Users){
					if(err){
						console.log(err);
					}
					res.render('superAdmin',{title:"系统管理页面--基于WEBGL的3D场景实现",'SightMsgs':SightMsgs,'Users':Users});
					
				})
		});
	
});
//删除场景
app.delete("/delete/sightmsgs",function(req,res){
	var id = req.query.id;
	if(id) {
		SightMsg.remove({_id: id},function(err,movie) {
			if(err){
				console.log(err);
			}
			else{
				res.json({success: 1});
			}
		})
	}
});
// 删除用户
app.delete("/delete/users",function(req,res){
	var id = req.query.id;
	if(id) {
		User.remove({_id: id},function(err,movie) {
			if(err){
				console.log(err);
			}
			else{
				res.json({success: 1});
			}
		})
	}
});