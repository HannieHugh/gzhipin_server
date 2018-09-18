var express = require('express');
var router = express.Router();


const {UserModel} = require('../db/models');
const md5 = require('blueimp-md5');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/*定义注册路由
   路由回调编程：
   1.获取请求参数
   2.处理数据
   3.返回响应
*/
/*
router.post('/register',function (req,res) {
  const {username,password} = req.body;
  //2.处理数据:有可能需要操作数据库
  if(username==='admin'){
    //3.返回响应 （失败）
    res.send({code:1,msg:'用户已存在,请重新注册'})
  }else{
    //返回响应（成功）
    res.send({code:0,data:{_id:'aaa',username}})
  }
});
*/
/*定义注册的路由*/
router.post('/register',function (req,res) {
  //1.获取请求的参数数据
  const {username,password,type} = req.body;
  //2.处理数据
      //1.根据username查询users集合得到user
  UserModel.findOne({username},{password:0,_v:0},function (error,userDom) {
    console.log(userDom)
    if(error){
      console.log(error)
    }else{
      //console.log(userDom)
      if(userDom){
        //有对应的用户名，则用户名已存在，注册失败
        res.send({
          "code": 1,
          "msg": "此用户已存在"
        })
      }else{
        new UserModel({username,password:md5(password),type}).save((error,userDom)=>{
          //取出生成的_id
          const _id = userDom._id;
          //将用户的id保存到cookie中
          res.cookie('userid',_id);

          //没有相应的用户名，保存信息，注册成功,返回数据（不能带password）
          res.send({
            code:0,
            data:{
              code: 0,
              data: {
                _id,
                username,
                type
              }
            }
          });

        });

      }
    }


  })
});
/*定义登录页面的路由*/
router.post('/login',function (req,res) {
  //获取请求参数
  const {username,password} = req.body;
  //处理请求
  UserModel.findOne({username,password:md5(password)},{password:0,_v:0},function (error,userDom) {
    if(!userDom||error){
      res.send({
        "code": 1,
        "msg": "用户名或密码错误"
      })
    }else{
      //如果有，向cookie中保存userid，返回一个成功的响应
      res.cookie('userid',userDom._id);
      res.send({
        "code": 0,
        "data": userDom
      })
    }
  })

});


module.exports = router;
