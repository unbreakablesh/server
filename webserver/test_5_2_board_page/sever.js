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
app.get('/board',async (req,res)=>{

   let conn;
   try{
      conn = await oracledb.getConnection(dbConfig);

      let result = await conn.execute(
          'select count(*) from board'
      );

      console.log('모가나올까?'+result);
      console.log(result.rows[0]);
      console.log(result.rows);

      const totalText = result.rows[0];
      // 글의 총 갯수
      const pageTextCount = 5;
      // 한페이지에보여질 글의 갯수 사용자가 임의로 정하는거임
      const totalPages = Math.ceil(totalText / pageTextCount);
      // 총 페이지 수 계산



      /////////////////////////////////////////
      let currentPage =  req.query.page ? parseInt(req.query.page) : 1;
      // 현재 페이지 번호     이부분 모르겠음 ////////////////////////////////
      ///////////////////////////////////////////////////
      // req는 HTTP 요청 객체이며, req.query.page는 쿼리 매개변수에서 'page'에 해당하는 값을 가져오는 부분입니다.
      // 코드는 해당 값을 정수로 변환하고, 값이 없을 경우 기본값으로 1을 할당합니다



      const startRow = (currentPage - 1) * pageTextCount + 1;
      //5인 조건에서 현제 페이지가 1페이지면 글은 1부터 5까지고 2페이지면 6부터 10까지 지정이 되는데 저 뒤에
      // order by를 내림 차순으로 해서 저 1이 가장 최근 글 즉 아이디가 가장 높은글이 위피하게됨
      const endRow = currentPage * pageTextCount;
      // 페이지의 가장 위에 글 번호와 가자 마지막 글 번호를 지정해 주기 위해서

      console.log(`startRow: ${startRow}, endRow: ${endRow}`);
      // 확인용


       result = await conn.execute(
          'select title, author from board  where id between :startRow2222 AND :endRow2222 order by id desc'
           ,
           {
              startRow2222: startRow,
              endRow2222: endRow
              //sql 쿼리에서 변수는  따로 보내주어야 한다 !!!
           }

      );

      res.render('board',{
         writes:result.rows


      });

   }catch(err){
      console.error(err.message)
      res.status(500).send('Internal Server Error');
   }finally {
      if (conn) {
         try {
            await conn.close();
         } catch (err) {
            console.error(err);
         }
      }
   }
});
//////////////////////한페이지에 글 5개씩 보이게 해봄(내가 원하는 만큼 글이 최신순으로 보이게/////
