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

const session = require('express-session')
   app.post('/test', async (req, res) => {
      // <form id="log" action="/test"method="post">  폼테그에서 엑션값이 중요함  그걸로 하는거임
   const {nickname, password } = req.body;
      // const username = req.body.username;
      // const password = req.body.password;
   // 위엠꺼랑 두줄을 하나로 합친 코드 !!
   const authenticateuser = await varifyID(nickname,password)
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

///////////////////////////////////////////////
////게시판 연결//////

app.get('/board',async (req,res)=>{

   let conn_1;
   try{
      conn_1 = await oracledb.getConnection(dbConfig);


      // sql_query = 'select title, author from board';
      // let result = await conn_1.execute(sql_query);
      //     sql 쿼리가 길면 이렇게 하는게 깔끔할수있다.


      let result = await conn_1.execute(
          'select title, author from board'
      );

      // let result = await conn_1.execute(
      //     'select title, author from board;'
      // );
      ///// 바로 위엠꺼가 안되는거  왜 안되는지 세미콜론이 들어가면 망함


      console.log(result.rows);
         // 그냥 확인용 되는지 안되는지
      res.render('board',{writes:result.rows});
       // 저 write가 모냐 하면 ejs구멍에  제대로 넣기 위해서  서로 맞춘 변수라고 보면 됨


   }catch(err){
      console.error(err.message)
      res.status(500).send('Internal Server Error');
   }finally {
      if (conn_1) {
         try {
            await conn_1.close();
         } catch (err) {
            console.error(err);
         }
      }
   }




})

