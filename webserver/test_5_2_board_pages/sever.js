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
   const {nickname, password } = req.body;
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
      const result = await connection.execute(sql_query,{nickname,password})
      if(result.rows.length > 0){
         console.log(result.rows[0]);
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
   try {
      conn = await oracledb.getConnection(dbConfig);

      let result = await conn.execute(
          'select count(*) from board'
      );

      console.log('모가나올까?' + result);
      console.log(result.rows[0]);
      console.log(result.rows);

      const totalText = result.rows[0];
      const pageTextCount = 3;
      const totalPages = Math.ceil(totalText / pageTextCount);


      /////////////////////////////////////////
      let currentPage = req.query.pageee ? parseInt(req.query.pageee) : 1;
      //삼항연산자이다
      // 따라서, req.query.pageee가 쿼리 파라미터가 없거나 값이 거짓일 경우에 currentPage는 1이 됩니다.
      // 현재 페이지 번호     이부분 모르겠음 ////////////////////////////////
      ///////////////////////////////////////////////////
      // <a href="/board/?pageee=<%= i %>"><%= i %></a>  board.ejs의 url이 페이지 바꿀때 마다 바뀜

      // req는 HTTP 요청 객체이며, req.query.page는 쿼리 매개변수에서 'page'에 해당하는 값을 가져오는 부분입니다.
      // 코드는 해당 값을 정수로 변환하고, 값이 없을 경우 기본값으로 1을 할당합니다


      console.log('currentPage:' + currentPage);

      const startRow = (currentPage - 1) * pageTextCount + 1;
      const endRow = currentPage * pageTextCount;

      console.log(`startRow: ${startRow}, endRow: ${endRow}`);

      result = await conn.execute(
          'select title, author from board  where id between :startRow2222 AND :endRow2222 order by id desc'
          ,
          {
             startRow2222: startRow,
             endRow2222: endRow
          }
      );
      //////////////////////페이징 처리 ////////

      const MAX_PAGE_LIMIT = 3; // 전체 페이징 번호 갯수
      //위에는 내가 정하는값
      // n개씩 페이징 처리를 하기 위해 화면에 보이는 페이지 번호를 계산
      // 현재 페이지를 중심으로 전체 페이지에서 현재페이지를 뺀 값이 n(한 화면에 페이징하는 갯수)보다 작다면 시작 페이지를 조정한다.
      // 만약에 현재 페이지가 3을 선택하여 3을 start page로 둔다면 3,4,5,6 이렇게 4개 밖에 표시가 되지 않는다. 따라서 2,3,4,5,6으로 만든다.
      // 즉, 선택한 페이지가 전체 페이지의 끝으로 가더라도 화면에 5(한 화면에 페이징하는 갯수)를 보장하기 위한 조건
      // currentPage(현재 페이지)가 1인 경우 (totalPages - currentPage) => 5 startPage: 1
      const startPage = (totalPages - currentPage) < MAX_PAGE_LIMIT ? totalPages - MAX_PAGE_LIMIT + 1 : currentPage;
      // 기본적으로 endPage는 startPage + MAX_PAGE_LIMIT - 1 이지만 totalPages를 초과하지 말아야 할 조건
      const endPage = Math.min(startPage + MAX_PAGE_LIMIT - 1, totalPages);
      console.log(`totalPages: ${totalPages}, currentPage: ${currentPage}, startPage: ${startPage}, endPage: ${endPage}`);

      /////////////페이징처리///////////////////


      res.render('board', {
         writes: result.rows,


///////////////////페이징을 위해 넘겨야하는 값////////

         startPage: startPage,
         currentPage: currentPage,
         endPage: endPage,
         totalPages: totalPages,
         maxPageNumber: MAX_PAGE_LIMIT

///////////////////////////////////////////////////

      });

   } catch (err) {
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


//////////////////////////페이지 번호 보이게 /////
