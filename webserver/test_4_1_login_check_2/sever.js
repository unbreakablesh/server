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

const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));

// app.post('/test',(req,res)=>{
//    console.log(req.body)
// } );

const dbConfig = require('./dbconfig');
const oracledb = require("oracledb");
oracledb.autoCommit = true;
oracledb.initOracleClient({ libDir: '../instantclient_21_13' });

async function selectDatabase222() {

   console.log("!!!!! db conenction !!!!!");

   let connection = await oracledb.getConnection(dbConfig);
   let binds = {};
   let options = {
      outFormat: oracledb.OUT_FORMAT_OBJECT   // query result format
   };
   console.log("!!!!! db select !!!!!");
   let result = await connection.execute("select * from webnovel", binds, options);

   console.log("!!!!! db response !!!!!");
   console.log(result.rows);
   console.log(result.rows[1]);
   console.log(result.rows[1].NAME)
   console.log("!!!!! db close !!!!!");
   await connection.close();
}
selectDatabase222()


///////////////////3가지 깔아보자///////////////////
/////////////////////////////////////////////
/////우선 교수님 코드에서 내껄로 데이터 바꾸고 로긴 확인함


const session = require('express-session')
// npm i express-session
// 설치함

   app.post('/test', async (req, res) => {
      // <form id="log" action="/test"method="post">  폼테그에서 엑션값이 중요함  그걸로 하는거임

   const {nickname, password } = req.body;
      // const username = req.body.username;
      // const password = req.body.password;
   // 위엠꺼랑 두줄을 하나로 합친 코드 !!


   // 사용자 인증작업
   const authenticateuser = await varifyID(nickname,password)

   // 인증 성송시 웰컴 페이지로 라우팅
   if (authenticateuser){
      res.render('welcome',{nickname});

   }else {
      res.render('welcome',{nickname})
   }

});


async function varifyID(nickname,password){
   let connection;

   try{
      connection = await oracledb.getConnection(dbConfig);
      sql_query = 'select * from webnovel where nickname = :nickname and password = :password';
      //ececute({[sql쿼리],[바인딩정보],[옵션]);
      //바인딩 정보는 기존 SQL쿼리에서 자바스크립트 변수를 사용할수있게 해주는 맵핑정보
      const result = await connection.execute(sql_query,{nickname,password})

      if(result.rows.length > 0){
         console.log(result.rows[0]);
         //간단한 쿼리의 경우  execute 함수에 3번째 인자 생략해도 컬럼명으로 접근가능,
         return{
            id: result.rows[0].ID,
            username: result.rows[0].nickNAME,
            name: result.rows[0].NAME
         };
      }else{
         return null;
      }


   }catch ( error){
      console.error('오류발생: ', error)
   }finally {
      if (connection){
         await connection.close();
      }
   }

}
