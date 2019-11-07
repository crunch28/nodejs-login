var express = require("express");
var passport = require("passport");
var User = require("../schema/user");
var router = express.Router();

//템플릿용 변수 설정
router.use(function(req,res,next){
  res.locals.currentUser = req.user;
  res.locals.errors = req.flash("error");
  res.locals.infos = req.flash("info");
  next();
});

//컬렉션을 쿼리하고, 가장 최근 사용자를 먼저 반환(descending)
router.get("/",function(req,res,next){
  User.find().sort({createAt:"descending"})
  .exec(function(err,users){
    if(err){return next(err);}
    res.render("index",{users:users});
  });
});

router.get("/signup",function(req,res){
  res.render("signup");
});

router.post("/signup",function(req,res,next){
  var username = req.body.username;
  var password = req.body.password;
  User.findOne({username:username},function(err,user){
    if(err){return next(err);}
    if(user){
      req.flash("error","사용자가 이미 있습니다.");
      return res.redirect("/signup");
    }
    var newUser = new User({
      username:username,
      password:password
    });
    newUser.save(next);
  });
},passport.authenticate("login",{
  successRedirect:"/",
  failureRedirect:"/signup",
  failureFlash:true
}));

router.get("/users/:username",function(req,res,next){
  User.findOne({username:req.params.username},function(err,user){
    if(err) {return next(err);}
    if(!user){return next(404);}
    res.render("profile",{user:user});
  });
});

router.get("/login",function(req,res){
  res.render("login");
});

router.post("/login",passport.authenticate("login",{
  successRedirect: "/",
  failureRedirect: "/login",
  failureFlash : true
}));

router.get("/logout",function(req,res){
  req.logout();
  res.redirect("/");
});

function ensureAuthenticated(req,res,next){
  if(req.isAuthenticated()){
    next();
  }else{
    req.flash("info","먼저 로그인해야 이 페이지를 볼 수 있습니다.");
    res.redirect("/login");
  }
}

router.get("/edit",ensureAuthenticated,function(req,res){
  res.render("edit");
});

//put메서드는 현재 html에서 get post만 되니까 post로 일단 구현
router.post("/edit",ensureAuthenticated,function(req,res,next){
  req.user.displayName = req.body.displayname;
  req.user.bio = req.body.bio;
  req.user.save(function(err){
    if(err){next(err);return;}
    req.flash("info","Profile updated!");
    res.redirect("/edit");
  });
});
module.exports = router;
