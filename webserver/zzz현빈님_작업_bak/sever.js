const express = require('express');
const app = express();
const port = 3000;
const session = require('express-session')
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
app.use(express.json())
app.use(express.urlencoded({extended:true}))
// const dbConfig = require('./dbconfig');
const oracledb = require("oracledb");
oracledb.autoCommit = true;
oracledb.initOracleClient({ libDir: '../instantclient_21_13' });

const path = require('path');
const WEB_SERVER_HOME = 'C:\\JWLee\\util\\nginx window\\nginx-1.24.0\\html';
// const WEB_SERVER_HOME = 'C:\\JWLee\\portfolio\\2차 프로젝트\\server_test\\server\\webserver\\test_11_nginx\\public';
const UPLOADS_FOLDER = path.join(WEB_SERVER_HOME, 'uploads');
app.use('/', express.static(WEB_SERVER_HOME+ '/'));

const dbConfig = {
   user: 'jwuk',
   password: '1234',
   connectString: 'localhost:1521/xe'
};


app.use('/am_episode', require('./routes/am_episode'));
app.use('/am_view', require('./routes/am_view'))





app.use(session({
   secret: 'mySecretKey', // 세션을 암호화하기 위한 임의의 키
   resave: false,
   saveUninitialized: true,   //모든 세션 정보 버장
}));
app.post('/login', async (req, res) => {
   const { username, password } = req.body;

   const isAuthenticated = await varifyID(username, password);

   if (isAuthenticated) {
      req.session.loggedIn = true;
      req.session.username = username;

      // 이전 페이지로 리다이렉트 또는 홈 페이지로 이동
      const redirectURL = req.query.redirect || '/home';
      res.redirect(redirectURL);
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
   let conn
   conn = await oracledb.getConnection(dbConfig);
   sql_query = 'SELECT t.novel_id AS title_novel_id, t.novel_name, ' +
       '       a.author_id, a.pen_name, ' +
       '       n.novel_id AS novel_id, n.status, n.like_count, n.views ' +
       'FROM title t ' +
       'JOIN novels n ON t.novel_id = n.novel_id ' +
       'JOIN authors a ON n.author_id = a.author_id';

   const result = await conn.execute(sql_query)



   res.render('all', {
      novel: result.rows
   });

   //
   // res.render('all')
});















app.listen(port, () => {
   console.log(`서버열림 : http://localhost:${port}/home`);
});

app.get('/my',(req,res)=>{
   if (!req.session.loggedIn) {
      return res.redirect('/login'); // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
   }
   res.render('my')
});

app.get('/myNovelList',(req,res)=>{

   res.render('myNovelList')
});


app.get('/novelWrite',(req,res)=>{

   res.render('novelWrite')
});

app.post('/add', async (req, res) => {
   console.log(req.body);

   const insertSQL = 'INSERT INTO episode (novel_id, ep_id, ep_title, rg_date, views, likes, content) VALUES (3, episode_id_seq.NEXTVAL, :epTitle, CURRENT_TIMESTAMP, 0, 0, :epContent)';
   let conn;

   try {
      // OracleDB 연결
      conn = await oracledb.getConnection(dbConfig);

      // 데이터 삽입 실행
      const result = await conn.execute(insertSQL, {
         epTitle: req.body.writeTitle,
         epContent: req.body.writeContent
      });

      console.log('데이터가 성공적으로 삽입되었습니다.');
   } catch (error) {
      console.error('데이터 삽입 중 오류 발생:', error);
   } finally {
      // 연결 종료
      if (conn) {
         await conn.close();
      }
   }



});

app.post('/add-comment', async (req, res) => {
   const { commentContent, epId, username } = req.body;
   console.log(commentContent, epId, username);

   let conn;

   try {
      conn = await oracledb.getConnection(dbConfig);
      const sql_query = 'INSERT INTO epi_comment (ep_id, comment_id,username, comment_text) VALUES (:epId, epi_comment_id_seq.nextval , :username, :commentContent)';
      const binds = { epId, username, commentContent };
      const options = { autoCommit: true };

      await conn.execute(sql_query, binds, options);

      console.log('댓글이 성공적으로 작성되었습니다.');
      res.status(200).send('댓글이 성공적으로 작성되었습니다.');
   } catch (error) {
      console.error('Error in /add-comment:', error);
      res.status(500).send('댓글 작성 중에 오류가 발생했습니다.');
   } finally {
      if (conn) {
         try {
            await conn.close();
         } catch (error) {
            console.error('Error closing database connection:', error);
         }
      }
   }
});

app.get('/check-login-status', (req, res) => {
   // 세션에서 로그인 정보를 확인
   const loggedIn = req.session.loggedIn;
   const username1 = req.session.username;

   // 클라이언트에 로그인 상태를 응답
   res.json({ loggedIn, username1});
});


// 서버 측 최신 댓글 가져오기 엔드포인트
// app.get('/get-latest-comments', async (req, res) => {
//    try {
//       const conn = await oracledb.getConnection(dbConfig);
//       const sql_query = 'SELECT * FROM epi_comment';
//       const options = { outFormat: oracledb.OUT_FORMAT_OBJECT };
//       const result = await conn.execute(sql_query, {}, options);
//
//       res.status(200).json(result.rows);
//    } catch (error) {
//       console.error('Error getting latest comments:', error);
//       res.status(500).send('Error getting latest comments');
//    } finally {
//       if (conn) {
//          await conn.close();
//       }
//    }
// });
//















// app.get('/add-comment', (req, res) => {
//    const username = req.session.username;
//    res.render('add-comment', { username });
// });
//



