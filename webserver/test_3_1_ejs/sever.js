const express = require('express');
const app = express();

app.listen(3000, () => {
   console.log('서버열림 : http://localhost:3000/home')
});
// app.get('/webnovel',(req,res)=>{
//    res.sendFile(__dirname + '/lay_out10.html');
// });
app.use(express.static('public'));

//////////////////////////
// 데이터베이스 지우고
// ejs이용하는게 목표

app.set('view engine', 'ejs');
// ejs사용가능하게 해주는 코드

app.get('/home', (req, res) => {
   res.render('home')
});
// views폴더 에 home.ejs 를 렌더함
// <a href="/log_in">로그인</a> 이런식으로 로그인 버튼을 누르면 /log_in 로 get요청 되게 해놈

app.get('/log_in', (req, res) => {
   res.render('log_in')
});
// log_in 로 get요청 되게 해놨으까