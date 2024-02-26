const express = require('express');
const app = express();

app.listen(3000, () => {
   console.log('서버열림 : http://localhost:3000/home')
});
app.use(express.static('public'));

app.set('view engine', 'ejs');

app.get('/home', (req, res) => {
   res.render('home', {'nickname':null})
   /////////////////////////////// 로긴 안되있으면 else로 빠져서 로긴 버튼 나오게  ejs//////////////////

});

app.get('/login', (req, res) => {
   res.render('login')
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





///////////////////////////////////////////////////////////////////////////
const session = require('express-session')

app.use(session({
   secret: 'mySecretKey', // 세션을 암호화하기 위한 임의의 키
   resave: false,
   saveUninitialized: false,   //모든 세션 정보 버장
   //세션의 유지 시간은 기본값은 브라우저 종료시까지 유지
   // cookie:{
   //    maxAge: 5000 //단위는 밀리세컨드
   //
   // }
}));
////////////////////////////////////////////////////////////////////////////
   app.post('/test', async (req, res) => {
   const {nickname, password } = req.body;
   const authenticateuser = await varifyID(nickname,password)


   if (authenticateuser){

//////////////////////////////////////////////////////////////////////
      req.session.loggedIn = true; // 세션에 loggedIn 이라는 변수 생성및 초기화
      req.session.username = nickname;
   ///////////////////////////////////////////////////////////////////////


      // res.render('welcome',{nickname});
      res.render('home',{nickname});
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


//////////////////////////////////////////////////
   if (!req.session.loggedIn) {
      return res.redirect('/login');
   }
  //////////////////////////////////////////////////
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

app.get('/detailPage/:iddd',async (req, res)=>{

   const postId123 = req.params;
   const postId = req.params.iddd;

   console.log(postId123);
   console.log(postId);

   let conn
   conn = await oracledb.getConnection(dbConfig);

   const result = await conn.execute(
       'select * from board where id = :iddd ',
       {'iddd':postId}

   )
   console.log(result.rows[0])


   res.render('detail',{
      detail_contttt : {
         'title' : result.rows[0][1],
         'id' : result.rows[0][0],
         'author' : result.rows[0][2]
         }

   })

} );

///////////// 로그인페이지 이식 //////

//////////////////// 몬가 이거가지고 로그인 파악하는거 같음 !!!!?????////
// 로그인이 안되면  암것도 못하게 만들어야함
// if (!req.session.loggedIn) {
//    return res.redirect('/login'); // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
// }

// const session = require('express-session');

// app.use(session({
//    secret: 'mySecretKey', // 세션을 암호화하기 위한 임의의 키
//    resave: false,
//    saveUninitialized: true ,   //모든 세션 정보 버장
//    //세션의 유지 시간은 기본값은 브라우저 종료시까지 유지
//    // cookie:{
//    //    maxAge: 35000 //단위는 밀리세컨드
//    //
//    // }
// }));


// 위 에 코드에 추가  표시해놓겠음