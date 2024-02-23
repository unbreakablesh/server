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



      let currentPage = req.query.pageee ? parseInt(req.query.pageee) : 1;



      console.log('currentPage:' + currentPage);

      const startRow = (currentPage - 1) * pageTextCount + 1;
      const endRow = currentPage * pageTextCount;

      console.log(`startRow: ${startRow}, endRow: ${endRow}`);

      result = await conn.execute(
          'SELECT id, title, author FROM (SELECT id, title, author, ROW_NUMBER() OVER (ORDER BY id DESC) as rm FROM board) WHERE rm BETWEEN :startRow2222 AND : endRow2222'
          ,
          {
             startRow2222: startRow,
             endRow2222: endRow
          }
      );

      const MAX_PAGE_LIMIT = 3;

      const startPage = (totalPages - currentPage) < MAX_PAGE_LIMIT ? totalPages - MAX_PAGE_LIMIT + 1 : currentPage;

      const endPage = Math.min(startPage + MAX_PAGE_LIMIT - 1, totalPages);
      console.log(`totalPages: ${totalPages}, currentPage: ${currentPage}, startPage: ${startPage}, endPage: ${endPage}`);

      res.render('board', {
         writes: result.rows,

         startPage: startPage,
         currentPage: currentPage,
         endPage: endPage,
         totalPages: totalPages,
         maxPageNumber: MAX_PAGE_LIMIT

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


//////////////////////////상세페이지 작성 해보겠음 ////
/////우선 글 부분에 a 태그를 걸고  상세페이지 하나 만들어서 또 자료를  넣어보아야함//////
    ///페이징 부분이  아직 좀 부족한데  우선  넘어가고  나중에 제대로 다시 확인해보겠음


app.get('/detailPage/:iddd',async (req, res)=>{

   const postId123 = req.params;
   const postId = req.params.iddd;

   console.log(postId123);
   // 이건 객체처럼 { iddd: '13' }  이렇게 나오고
   console.log(postId);
   // 이건 .iddd 로 꼭 찍어서 13이 나옴

   let conn
   conn = await oracledb.getConnection(dbConfig);

   const result = await conn.execute(
       'select * from board where id = :iddd ',
       {'iddd':postId}
   // { fetchInfo: { CONTENT: { type: oracledb.STRING } } }
       //이거 롱  contents  일때 썼던거 이제 기억남

   )
   console.log(result.rows[0])


   res.render('detail',{
      // detail_cont : result.rows,
      detail_contttt : {
         'title' : result.rows[0][1],
         'id' : result.rows[0][0],
         'author' : result.rows[0][2]
         }
         // 객체안에 객체로 넣어 줘야함  개중요 !!!!!!!!!!!!!!!!!!!!!!!

   })

} );