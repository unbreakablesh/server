const express = require('express');
const app = express();
const port = 3000;
// const upload = multer({ dest: path.join(__dirname, 'temp'), encoding: 'utf8' });


app.use(express.static('public'));

app.set('view engine', 'ejs');

app.get('/home', (req, res) => {
   res.render('home', {'nickname': null})
   /////////////////////////////// 로긴 안되있으면 else로 빠져서 로긴 버튼 나오게  ejs//////////////////

});

app.get('/login', (req, res) => {
   res.render('login')
});

const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended: true}));

// const dbConfig = require('./dbconfig');
const oracledb = require("oracledb");
oracledb.autoCommit = true;
oracledb.initOracleClient({libDir: '../instantclient_21_13'});

const path = require('path');
const WEB_SERVER_HOME = 'C:\\JWLee\\util\\nginx window\\nginx-1.24.0\\html';
// const WEB_SERVER_HOME = 'C:\\JWLee\\portfolio\\2차 프로젝트\\server_test\\server\\webserver\\test_11_nginx\\public';
const UPLOADS_FOLDER = path.join(WEB_SERVER_HOME, 'uploads');
app.use('/', express.static(WEB_SERVER_HOME+ '/'));

const dbConfig = {
   // user: 'jwuk',
   // password: '1234',
   // connectString: '192.168.0.32:1521/xe'
   user          :"ljwTest",
   password      : "1111",
   connectString : "localhost:1521/xe"
};




// async function selectDatabase222() {
//
//    console.log("!!!!! db conenction !!!!!");
//
//    let connection = await oracledb.getConnection(dbConfig);
//    let binds = {};
//    let options = {
//       outFormat: oracledb.OUT_FORMAT_OBJECT   // query result format
//    };
//    console.log("!!!!! db select !!!!!");
//    let result = await connection.execute("select * from webnovel", binds, options);
//
//    console.log("!!!!! db response !!!!!");
//    console.log(result.rows);
//    console.log(result.rows[1]);
//    console.log(result.rows[1].NAME)
//    console.log("!!!!! db close !!!!!");
//    await connection.close();
// }
//
// selectDatabase222()
//

const session = require('express-session')

app.use(session({
   secret: 'mySecretKey', // 세션을 암호화하기 위한 임의의 키
   resave: false,
   saveUninitialized: true,   //모든 세션 정보 버장
}));
app.post('/login', async (req, res) => {
   const {username, password} = req.body;

   console.log(JSON.stringify({username, password}))
   const authenticateUser = await varifyID(username, password);

   console.log(authenticateUser);

   if (authenticateUser) {
      req.session.loggedIn = true;
      req.session.username = authenticateUser.username; // 수정된 부분

      res.render('home', { username: req.session.username });
   } else {
      res.render('welcome', { username });
   }
});

async function varifyID(username, password) {
   let connection;
   try {
      connection = await oracledb.getConnection(dbConfig);
      sql_query = 'SELECT USERNAME FROM users WHERE username = :username AND password = :password';
      const result = await connection.execute(sql_query, { username, password });
      console.log(JSON.stringify(result))

      if (result.rows.length > 0) {
         // 세션에는 사용자 이름만 저장
         return { username: result.rows[0][0] };
      } else {
         return null;
      }
   } catch (error) {
      console.error('오류발생: ', error);
   } finally {
      if (connection) {
         await connection.close();
      }
   }
}



app.get('/board', async (req, res) => {


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
   } finally {
      if (conn) {
         try {
            await conn.close();
         } catch (err) {
            console.error(err);
         }
      }
   }
});

app.get('/detailPage/:iddd', async (req, res) => {

   const postId123 = req.params;
   const postId = req.params.iddd;

   console.log(postId123);
   console.log(postId);

   let conn
   conn = await oracledb.getConnection(dbConfig);

   const result = await conn.execute(
       'select * from board where id = :iddd ',
       {'iddd': postId}
   )
   console.log(result.rows[0])

   res.render('detail', {
      detail_contttt: {
         'title': result.rows[0][1],
         'id': result.rows[0][0],
         'author': result.rows[0][2]
      }
   })
});

app.get('/writing', (req, res) => {
   res.render('writing')
});

app.post('/www', async (req, res) => {

   const {title, content} = req.body;
   let conn;
   try {
      conn = await oracledb.getConnection(dbConfig);

      const result = await conn.execute(
          `SELECT board_seq.NEXTVAL
           FROM DUAL`
      );
      const postId = result.rows[0][0];
      await conn.execute(
          `INSERT INTO board (id, title, author)
           VALUES (:id, :title, :content)`,
          [postId, title, content]
      );


      // 게시글 작성 후 게시판 메인 페이지로 리다이렉트
      res.redirect('/board');
   } catch (err) {
      console.error('글 작성 중 오류 발생:', err);
      res.status(500).send('글 작성 중 오류가 발생했습니다.');
   } finally {
      if (conn) {
         try {
            await conn.close();
         } catch (err) {
            console.error('오라클 연결 종료 중 오류 발생:', err);
         }
      }
   }

});

app.get('/edit/:id', async (req, res) => {
   const postId = req.params.id;
   let conn
   conn = await oracledb.getConnection(dbConfig);

   const result = await conn.execute(
       'select * from board where id = :id ',
       {'id': postId}
   )
   res.render('edit', {
      edit_conmnm: {
         'title': result.rows[0][1],
         'id': result.rows[0][0],
         'author': result.rows[0][2]
      }
   })
});
app.post('/editafter/:idpppp', async (req, res) => {
   const {title, content} = req.body;
   const postId = req.params.idpppp;
   let conn;
   try {
      conn = await oracledb.getConnection(dbConfig);

      await conn.execute(
          `UPDATE board
           SET title = :title,
               author = :contentttttt
           WHERE id = :id`,
          [title, content, postId]
      );
      res.redirect(`/detailPage/${postId}`);
   } catch (err) {
      console.error('게시글 수정 중 오류 발생:', err);
      res.status(500).send('게시글 수정 중 오류가 발생했습니다.');
   } finally {
      if (conn) {
         try {
            await conn.close();
         } catch (err) {
            console.error('오라클 연결 종료 중 오류 발생:', err);
         }
      }
   }
});

//////////////////////////////////////////////////////////////////
///////////// 삭제삭제삭제////////////////////////////////////////////
////////////////////////////////////////////////////////////
// form 의  액션이 아닌ㄴ a  태그의 주소로 get 받아서 삭제하는듯

//detail에  아래꺼 추가함
// <a href="/deletegogo/<%= detail_contttt.id %>" className="on">삭제</a>

app.get('/deletegogo/:id', async (req, res) => {
   // 로그인 여부 확인
   if (!req.session.loggedIn) {
      return res.redirect('/login'); // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
   }

   const postId = req.params.id;
   // const userId = req.session.userId
   // const userName = req.session.username;
   // const userRealName = req.session.userRealName;
   // 위에  세개를 어디에 쓰는걸까???  나중에 쓸일이 생기겠지???

   let conn;
   try {
      conn = await oracledb.getConnection(dbConfig);

      // 게시글 삭제
      await conn.execute(
          `DELETE FROM board WHERE id = :id`,
          [postId]
      );

      // res.redirect(`/board?id=${userId}&username=${userName}&name=${userRealName}`);
      // res.redirect(`/board?id=${userId}`);
      res.redirect('/board');
      // 삭제 후 게시판 메인 페이지로 리다이렉트


   } catch (err) {
      console.error('게시글 삭제 중 오류 발생:', err);
      res.status(500).send('게시글 삭제 중 오류가 발생했습니다.');
   } finally {
      if (conn) {
         try {
            await conn.close();
         } catch (err) {
            console.error('오라클 연결 종료 중 오류 발생:', err);
         }
      }
   }
});


/////////////////////////////현빈님 작업과 조인////////////


app.get('/all', async (req, res) => {
   if (!req.session.loggedIn) {
      return res.redirect('/login'); // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
   }
   let conn
   conn = await oracledb.getConnection(dbConfig);
   sql_query = 'SELECT t.novel_id AS title_novel_id, t.novel_name, ' +
       '       a.author_id, a.pen_name, ' +
       '       n.novel_id AS novel_id, n.status, n.like_count, n.views ' +
       'FROM title t ' +
       'JOIN novels n ON t.novel_id = n.novel_id ' +
       'JOIN authors a ON n.author_id = a.author_id';
   console.log(sql_query)
   const result = await conn.execute(sql_query)

   console.log('우아아아앙아아아아아아')
   console.table(result.rows[0][1])

   res.render('all', {
      novel: result.rows
   });
   console.log(result.rows[0][1])
   //
   // res.render('all')
});


app.get('/am_episode', async (req, res) => {
   let conn
;


   conn = await oracledb.getConnection(dbConfig);

   sql_query =
       'SELECT'
   't.novel_name AS title,'+
     ' t.novel_id,'+
       'e.ep_title AS episode_title,'+
      ' a.pen_name AS author_pen_name'+
   'FROM'+
   'title t'+
   'JOIN'+
   'novels n ON t.novel_id = n.novel_id'+
   'LEFT JOIN'+
   'episode e ON t.novel_id = e.novel_id'+
   'LEFT JOIN'+
   'authors a ON n.author_id = a.author_id'+
   'WHERE'+
   't.novel_id = 1;'+



   console.log(sql_query)
   const result = await conn.execute(sql_query)

   console.log('우아아아앙아아아아아아')
   console.table(result.rows[0][1])

   res.render('am_episode', {
      novel: result.rows
   });
   console.log(result.rows[0][1])
});

app.get('/am_view', (req, res) => {


   res.render('am_view')
});


app.listen(port, () => {
   console.log(`서버열림 : http://localhost:${port}/home`);
});

app.get('/my',(req,res)=>{

   res.render('my')
});

app.get('/myNovelList',(req,res)=>{

   res.render('myNovelList')
});


app.get('/novelWrite',(req,res)=>{

   res.render('novelWrite')
});
