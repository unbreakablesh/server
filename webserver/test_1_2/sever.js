const express = require('express');
const app = express();

app.listen(3000,()=>{
   console.log('서버열림 : http://localhost:3000/webnovel')
});

app.get('/webnovel',(req,res)=>{
   res.sendFile(__dirname + '/lay_out10.html');
});

// get요청으로 html을 보내주고

app.use(express.static('public'));
// html이 참조할수 있게 폴더를  지정해줌  이미지 css  등