const express = require("express");
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
 
const route = require("./routes/route.js");//라우트분할
const setUpPassport = require("./setuppassport");
 
const app = express();

//test 데이터베이스로 연결
mongoose.connect("mongodb://localhost:27017/test",{useMongoClient: true});
setUpPassport();

app.set("port",process.env.PORT || 8000);
app.set("views",path.join(__dirname,"views"));
app.set("view engine","ejs");
 
app.use(bodyParser.urlencoded({extended:false}));
app.use(cookieParser());
app.use(session({
  secret:"passport",//임의의 문자
  resave:true,
  saveUninitialized:true
}));
/*secret : 각 세션이 클라이언트에서 암호화되도록함. 쿠키해킹방지
resave : 미들웨어 옵션, true하면 세션이 수정되지 않은 경우에도 세션 업데이트
saveUninitialized : 미들웨어 옵션, 초기화되지 않은 세션 재설정*/

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(route);
app.listen(app.get("port"),function(){
  console.log("Server started on port"+app.get("port"));
});
