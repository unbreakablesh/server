const express = require('express');
const app = express();

app.listen(3000, () => {
   console.log('서버열림 : http://localhost:3000/home')
});
app.use(express.static('public'));

app.set('view engine', 'ejs');

app.get('/home', (req, res) => {
   res.render('home')
});

app.get('/log_in', (req, res) => {
   res.render('log_in')
});

///////////////////////////////////////////
// login input을 통해 데이터를 post로 받는걸  해보아야겠다
// 바디파셔를 깔아야겠다

const bodyParser = require('body-parser');
// 필요없다던데...안쓰면 안되더라구..   req.body 쓰기 위해서

app.use(bodyParser.urlencoded({ extended: true }));
// 아무생각없이 쓰는 문법 한줄 더 써야함 제대로는

app.post('/test',(req,res)=>{
   console.log(req.body)
} );
// 콘솔로 로그인 버튼 누르면 입력값 전송되는거 확인