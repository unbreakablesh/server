const express = require('express');
const app = express();
const port = 3000;
const session = require('express-session')
const multer = require('multer');
const fs = require('fs');
// const path = require('path')
// const upload = multer({ dest: path.join(__dirname, 'temp'), encoding: 'utf8' });

app.use(express.static('public'));

app.set('view engine', 'ejs');

app.get('/home', (req, res) => {
   res.render('home', {'username': null})
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

const storage = multer.diskStorage({
   destination: function (req, file, cb) {
      cb(null, 'public/uploads'); // 파일이 저장될 경로
   },
   filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
   }
});




const path = require('path');
const upload = multer({storage: storage});
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
app.use('/notice', require('./routes/notice'));




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
      req.session.username = username; //이건 user1  이렇게  된거
      req.session.loggedInUserId = isAuthenticated.id
      // req.session.loggedRealName = isAuthenticated.name

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
      sql_query = 'SELECT * FROM users WHERE username = :username AND password = :password';
      const result = await connection.execute(sql_query, { username, password });
      console.log(JSON.stringify(result))

      if (result.rows.length > 0) {
         // 세션에는 사용자 이름만 저장
         return {
            username: result.rows[0][1],
            id: result.rows[0][0]

         };
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



// app.get('/board', async (req, res) => {
//
//
// //////////////////////////////////////////////////
//    if (!req.session.loggedIn) {
//       return res.redirect('/login');
//    }
//    //////////////////////////////////////////////////
//    let conn;
//    try {
//       conn = await oracledb.getConnection(dbConfig);
//
//       let result = await conn.execute(
//           'select count(*) from board'
//       );
//
//       console.log('모가나올까?' + result);
//       console.log(result.rows[0]);
//       console.log(result.rows);
//
//       const totalText = result.rows[0];
//       const pageTextCount = 3;
//       const totalPages = Math.ceil(totalText / pageTextCount);
//
//       let currentPage = req.query.pageee ? parseInt(req.query.pageee) : 1;
//
//       console.log('currentPage:' + currentPage);
//
//       const startRow = (currentPage - 1) * pageTextCount + 1;
//       const endRow = currentPage * pageTextCount;
//
//       console.log(`startRow: ${startRow}, endRow: ${endRow}`);
//
//       result = await conn.execute(
//           'SELECT id, title, author FROM (SELECT id, title, author, ROW_NUMBER() OVER (ORDER BY id DESC) as rm FROM board) WHERE rm BETWEEN :startRow2222 AND : endRow2222'
//           ,
//           {
//              startRow2222: startRow,
//              endRow2222: endRow
//           }
//       );
//
//       const MAX_PAGE_LIMIT = 3;
//
//       const startPage = (totalPages - currentPage) < MAX_PAGE_LIMIT ? totalPages - MAX_PAGE_LIMIT + 1 : currentPage;
//
//       const endPage = Math.min(startPage + MAX_PAGE_LIMIT - 1, totalPages);
//       console.log(`totalPages: ${totalPages}, currentPage: ${currentPage}, startPage: ${startPage}, endPage: ${endPage}`);
//
//       res.render('board', {
//          writes: result.rows,
//
//          startPage: startPage,
//          currentPage: currentPage,
//          endPage: endPage,
//          totalPages: totalPages,
//          maxPageNumber: MAX_PAGE_LIMIT
//
//       });
//
//    } catch (err) {
//       console.error(err.message)
//       res.status(500).send('Internal Server Error');
//    } finally {
//       if (conn) {
//          try {
//             await conn.close();
//          } catch (err) {
//             console.error(err);
//          }
//       }
//    }
// });

// app.get('/detailPage/:iddd', async (req, res) => {
//
//    const postId123 = req.params;
//    const postId = req.params.iddd;
//
//    console.log(postId123);
//    console.log(postId);
//
//    let conn
//    conn = await oracledb.getConnection(dbConfig);
//
//    const result = await conn.execute(
//        'select * from board where id = :iddd ',
//        {'iddd': postId}
//    )
//    console.log(result.rows[0])
//
//    res.render('detail', {
//       detail_contttt: {
//          'title': result.rows[0][1],
//          'id': result.rows[0][0],
//          'author': result.rows[0][2]
//       }
//    })
// });

// app.get('/writing', (req, res) => {
//    res.render('writing')
// });
//
// app.post('/www', async (req, res) => {
//
//    const {title, content} = req.body;
//    let conn;
//    try {
//       conn = await oracledb.getConnection(dbConfig);
//
//       const result = await conn.execute(
//           `SELECT board_seq.NEXTVAL
//            FROM DUAL`
//       );
//       const postId = result.rows[0][0];
//       await conn.execute(
//           `INSERT INTO board (id, title, author)
//            VALUES (:id, :title, :content)`,
//           [postId, title, content]
//       );
//
//
//       // 게시글 작성 후 게시판 메인 페이지로 리다이렉트
//       res.redirect('/board');
//    } catch (err) {
//       console.error('글 작성 중 오류 발생:', err);
//       res.status(500).send('글 작성 중 오류가 발생했습니다.');
//    } finally {
//       if (conn) {
//          try {
//             await conn.close();
//          } catch (err) {
//             console.error('오라클 연결 종료 중 오류 발생:', err);
//          }
//       }
//    }
//
// });

// app.get('/edit/:id', async (req, res) => {
//    const postId = req.params.id;
//    let conn
//    conn = await oracledb.getConnection(dbConfig);
//
//    const result = await conn.execute(
//        'select * from board where id = :id ',
//        {'id': postId}
//    )
//    res.render('edit', {
//       edit_conmnm: {
//          'title': result.rows[0][1],
//          'id': result.rows[0][0],
//          'author': result.rows[0][2]
//       }
//    })
// });
// app.post('/editafter/:idpppp', async (req, res) => {
//    const {title, content} = req.body;
//    const postId = req.params.idpppp;
//    let conn;
//    try {
//       conn = await oracledb.getConnection(dbConfig);
//
//       await conn.execute(
//           `UPDATE board
//            SET title = :title,
//                author = :contentttttt
//            WHERE id = :id`,
//           [title, content, postId]
//       );
//       res.redirect(`/detailPage/${postId}`);
//    } catch (err) {
//       console.error('게시글 수정 중 오류 발생:', err);
//       res.status(500).send('게시글 수정 중 오류가 발생했습니다.');
//    } finally {
//       if (conn) {
//          try {
//             await conn.close();
//          } catch (err) {
//             console.error('오라클 연결 종료 중 오류 발생:', err);
//          }
//       }
//    }
// });

//////////////////////////////////////////////////////////////////
///////////// 삭제삭제삭제////////////////////////////////////////////
////////////////////////////////////////////////////////////
// form 의  액션이 아닌ㄴ a  태그의 주소로 get 받아서 삭제하는듯

//detail에  아래꺼 추가함
// <a href="/deletegogo/<%= detail_contttt.id %>" className="on">삭제</a>

// app.get('/deletegogo/:id', async (req, res) => {
//    // 로그인 여부 확인
//    if (!req.session.loggedIn) {
//       return res.redirect('/login'); // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
//    }
//
//    const postId = req.params.id;
//    // const userId = req.session.userId
//    // const userName = req.session.username;
//    // const userRealName = req.session.userRealName;
//    // 위에  세개를 어디에 쓰는걸까???  나중에 쓸일이 생기겠지???
//
//    let conn;
//    try {
//       conn = await oracledb.getConnection(dbConfig);
//
//       // 게시글 삭제
//       await conn.execute(
//           `DELETE FROM board WHERE id = :id`,
//           [postId]
//       );
//
//       // res.redirect(`/board?id=${userId}&username=${userName}&name=${userRealName}`);
//       // res.redirect(`/board?id=${userId}`);
//       res.redirect('/board');
//       // 삭제 후 게시판 메인 페이지로 리다이렉트
//
//
//    } catch (err) {
//       console.error('게시글 삭제 중 오류 발생:', err);
//       res.status(500).send('게시글 삭제 중 오류가 발생했습니다.');
//    } finally {
//       if (conn) {
//          try {
//             await conn.close();
//          } catch (err) {
//             console.error('오라클 연결 종료 중 오류 발생:', err);
//          }
//       }
//    }
// });


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

app.get('/myNovelList', async (req, res) => {
   if (!req.session.loggedInUserId) {
      return res.redirect('/login'); // 로그인하지 않았다면 로그인 페이지로 리다이렉트
   }

   let conn;
   try {
      conn = await oracledb.getConnection(dbConfig);

      // author_id를 가진 모든 글을 novels 테이블에서 조회하되, title 테이블의 novel_name과 authors 테이블의 pen_name도 함께 조회한다.
      const novelQuery =
          `SELECT n.*, t.novel_name, a.pen_name ` +
          `FROM novels n ` +
          `JOIN title t ON n.novel_id = t.novel_id ` +
          `JOIN authors a ON n.author_id = a.author_id ` +
          `WHERE n.author_id = :authorId`;

      const novelResult = await conn.execute(novelQuery, {authorId: req.session.loggedInUserId});
      console.log(`결과: ` + JSON.stringify(novelResult.rows, null, 2));
      const novels = novelResult.rows;

      // 조회된 글들을 'myNovelList' 페이지에서 보여준다.
      res.render('myNovelList', {novels});

   } catch (error) {
      console.error('Error in /myNovelList:', error);
      res.status(500).send('작성 중인 글을 조회하는 중에 오류가 발생했습니다.');
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

      res.redirect('/myNovelList'); // 데이터 삽입 완료 후 myNovelList 페이지로 리다이렉트
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

app.get('/settingWrite', async (req, res) => {
   const novelId = req.query.novelId; // URL에서 novelId 가져오기
   let conn;

   try {
      conn = await oracledb.getConnection(dbConfig);

      // novelId를 사용하여 소설 조회
      const result = await conn.execute('SELECT * FROM novels WHERE novel_id = :novelId', { novelId });

      // 조회한 데이터를 settingWrite 페이지에 전달
      res.render('settingWrite', { novel: result.rows[0] });
   } catch (error) {
      console.error('데이터 조회 중 오류 발생:', error);
   } finally {
      if (conn) {
         await conn.close();
      }
   }
});

app.post('/submit_novel', upload.single('novelImage'), async (req, res) => {
   const {novelTitle, SynopsisContent, selectedGenres, penname} = req.body;
   const userId = req.session.loggedInUserId;

   // 기타 필요한 정보 수집

   // selectedGenres를 쉼표로 분리하여 mainGenre와 subGenre로 나누기
   const [mainGenre, subGenre] = selectedGenres.split(',');
   const imgUrl = req.file.path; // 파일의 경로를 imgUrl에 저장
   console.log(`제목이다:` + novelTitle);
   console.log(`작품소개다:` + SynopsisContent);
   console.log(`장르선택이다:` + selectedGenres);
   console.log(`필명이다:` + penname);
   console.log(req.file); // 업로드된 파일 정보

   let conn;

   try {
      conn = await oracledb.getConnection(dbConfig);

      // authors 테이블에 작가 정보 삽입
      const authorInsertQuery = 'INSERT INTO authors (author_id, user_id, pen_name) VALUES (author_id_seq.nextval, :userId, :penname) RETURNING author_id INTO :authorId'
      const authorInsertBinds = {userId, penname, authorId: {dir: oracledb.BIND_OUT, type: oracledb.NUMBER}};
      const authorInsertOptions = {autoCommit: true};

      // 작가 정보 삽입
      const authorResult = await conn.execute(authorInsertQuery, authorInsertBinds, authorInsertOptions);

      // 작가 정보 삽입 후 생성된 author_id를 얻습니다.
      const authorId = authorResult.outBinds.authorId[0];      // novels 테이블에 소설 정보 삽입
      // novels 테이블에 소설 정보 삽입 후, 생성된 novel_id를 반환
      const novelInsertQuery = 'INSERT INTO novels (novel_id, author_id, main_genre, sub_genre, intro, img_url) VALUES (novel_id_seq.nextval, :authorId, :mainGenre, :subGenre, :SynopsisContent, :imgUrl) RETURNING novel_id INTO :novelId';
      const novelInsertBinds = {
         authorId,
         mainGenre,
         subGenre,
         SynopsisContent,
         imgUrl,
         novelId: {dir: oracledb.BIND_OUT, type: oracledb.NUMBER}
      };
      const novelInsertOptions = {autoCommit: true};

      await conn.execute(novelInsertQuery, novelInsertBinds, novelInsertOptions);

      // 그 외 댓글 등을 추가로 삽입할 수 있습니다.
      const novelResult = await conn.execute(novelInsertQuery, novelInsertBinds, novelInsertOptions);
      console.log(novelResult)
      // 소설 정보 삽입 후 생성된 novel_id를 얻습니다.
      const novelId = novelResult.outBinds.novelId[0];

// title 테이블에 소설 제목 삽입
      const titleInsertQuery = 'INSERT INTO title (novel_id, novel_name) VALUES (:novelId, :novelTitle)';
      const titleInsertBinds = {novelId, novelTitle};
      const titleInsertOptions = {autoCommit: true};

      await conn.execute(titleInsertQuery, titleInsertBinds, titleInsertOptions);
      const novelQuery =
          `SELECT n.*, t.novel_name, a.pen_name ` +
          `FROM novels n ` +
          `JOIN title t ON n.novel_id = t.novel_id ` +
          `JOIN authors a ON n.author_id = a.author_id ` +
          `WHERE n.author_id = :authorId`;

      const novelResult2 = await conn.execute(novelQuery, {authorId});
      const novels = novelResult2.rows;

      res.render('myNovelList', {novels});
   } catch (error) {
      console.error('Error in /submit_novel:', error);
      res.status(500).send('소설 작성 중에 오류가 발생했습니다.');
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















// app.get('/add-comment', (req, res) => {
//    const username = req.session.username;
//    res.render('add-comment', { username });
// });
//
//////////////////////////////내작업  붙힌곳/////////////////////////////////

app.get('/board', async (req, res) => {


//////////////////////////////////////////////////
   if (!req.session.loggedIn) {
      return res.redirect('/login');
   }
   //////////////////////////////////////////////////

   const postId = req.params.id;



   let conn;
   try {
      conn = await oracledb.getConnection(dbConfig);


      let result = await conn.execute(
          'select count(*) from review_posts'
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

      //////// 정렬 방식에 따른 SQL 쿼리 작성////////////////////////////////////////////
      let orderByClause = 'ORDER BY p.created_at DESC'; // 기본적으로 최신순 정렬

      if (req.query.sort === 'views_desc') {
         orderByClause = 'ORDER BY p.views DESC, p.created_at DESC'; // 조회수 내림차순, 최신순
      }


      /////검색//////
      /////////////////검색 조건에 따른 SQL 쿼리 작성///////////////////////////////////////////
      let searchCondition = ''; // 기본적으로 검색 조건 없음

      if (req.query.searchType && req.query.searchInput) {
         const searchType = req.query.searchType;
         const searchInput = req.query.searchInput;
         // 쿼리로 받은 요청 처리 검색설정과 조건 쿼리로 받은 요청 처리 검색설정과
         // 쿼리로 받은 요청 처리 검색설정과 조건 쿼리로 받은 요청 처리 검색설정과


         // 검색 조건에 따라 WHERE 절 설정
         if (searchType === 'title') {
            searchCondition = ` AND p.title LIKE '%${searchInput}%'`;
            // searchCondition = `p.title LIKE '%${searchInput}%'`;
         } else if (searchType === 'content') {
            searchCondition = ` AND p.content LIKE '%${searchInput}%'`;
            // searchCondition = `p.content LIKE '%${searchInput}%'`;
         } else if (searchType === 'author') {
            searchCondition = ` AND u.username LIKE '%${searchInput}%'`;
            // searchCondition = `u.username LIKE '%${searchInput}%'`;
         }
      }
      // if() 다음 블록에 들어가는 조건: true, truesy (false가 아닌 모든값)
      // if() 다음 블록이 수행되지 않는 조건: false, falsy(0, null, NaN)




      result = await conn.execute(
          // 'SELECT id, title, author_id ,views ,to_char(created_at,\'YY-MM-DD hh-mm\')as created_at FROM (SELECT id, title, author_id, views ,created_at , ROW_NUMBER() OVER (ORDER BY id DESC) as rm FROM review_posts) WHERE rm BETWEEN :startRow2222 AND : endRow2222'
          // 'SELECT\n' +
          // '                 id,title,author,to_char(created_at,\'YYYY-MM-DD\'),views, \n' +
          // '                 (SELECT COUNT(*) FROM review_comments c WHERE c.post_id = p.id) AS comments_count\n' +
          // '             FROM (\n' +
          // '                      SELECT\n' +
          // '                          p.id, p.title, u.username AS author, p.created_at, p.views, p.likes,\n' +
          // '                          ROW_NUMBER() OVER(${orderByClause}) AS rn\n' +
          // '                      FROM review_posts p\n' +
          // '                               JOIN users u ON p.author_id = u.user_id\n' +
          // '                      WHERE 1=1 \n' +
          // '                          ${searchCondition}                 \n' +
          // '                  ) p\n' +
          // '             WHERE rn BETWEEN :startRow22221 AND :endRow2222'
          `SELECT id,title,author,to_char(created_at,'YYYY-MM-DD'),views,(SELECT COUNT(*) FROM review_comments c WHERE c.post_id = p.id) AS comments_count FROM(SELECT p.id, p.title, u.username AS author, p.created_at, p.views,  ROW_NUMBER() OVER(${orderByClause}) AS rn FROM review_posts p JOIN users u ON p.author_id = u.user_id  WHERE 1=1  ${searchCondition}) p WHERE rn BETWEEN :startRow2222 AND :endRow2222`
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
         // 'username': null
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
   const userName = req.session.username
   const userId = req.session.loggedInUserId
   const userRealName = req.session.loggedRealName


   console.log(postId123);
   console.log(postId);

   let conn
   conn = await oracledb.getConnection(dbConfig);

   await conn.execute(
       `UPDATE review_posts SET views = views + 1 WHERE id = :id`,
       [postId]
   );
   await conn.commit();



   const result = await conn.execute(
       'select * from review_posts where id = :iddd ',
       {'iddd': postId}
   )
   console.log(result.rows[0])

   //////댓글추가//////////////////////////////////

   const commentResult = await conn.execute(
       `SELECT c.id, c.author_id, c.content, u.username AS author, TO_CHAR(c.created_at, 'YYYY-MM-DD HH:MM') AS created_at, c.parent_comment_id 
            FROM review_comments c
            JOIN users u ON c.author_id = u.user_id
            WHERE c.post_id = :id 
            ORDER BY c.id`,
       [postId],

   );
   const comments = [];  // 댓글의 답글은 여기에 담기지 않음
   const commentMap = new Map(); // 댓글의 id를 key로 하여 댓글을 맵으로 저장

   console.log("comments :"+comments) // 이떈 암것도 안들어 있음


   commentResult.rows.forEach(row => {
      const comment = {
         id: row[0],
         author_id: row[1],
         content: row[2],
         author: row[3],
         created_at: row[4],
         children: [], // 자식 댓글을 저장할 배열
      };

      const parentId = row[5]; // 부모 댓글의 id

      if (parentId === null) {
         // 부모 댓글이 null이면 바로 댓글 배열에 추가
         comments.push(comment);
         commentMap.set(comment.id, comment); // 맵에 추가
      } else {
         // 부모 댓글이 있는 경우 부모 댓글을 찾아서 자식 댓글 배열에 추가
         const parentComment = commentMap.get(parentId);
         parentComment.children.push(comment);
      }
   });
   // const post = {
   //    id: postResult.rows[0][0],
   //    title: postResult.rows[0][1],
   //    author: postResult.rows[0][2],
   //    content: postResult.rows[0][3],
   //    created_at: postResult.rows[0][4],
   //    views: postResult.rows[0][5],
   //    likes: postResult.rows[0][6],
   //    file_original_name: postResult.rows[0][7],
   //    file_stored_name: postResult.rows[0][8]
   // };
   console.log("comments:"+comments) //위에는 없다고 나오지만  렌더하기전에 댓글있으면 자료 들어옴
   console.log("comments: " + JSON.stringify(comments));
   // 이런식으로 나옴 [{"id":25,"author_id":1,"content":"ff","author":"user1","created_at":"2024-03-02 10:03","children":[]}]
   console.log(JSON.stringify(comments.rows));// 이건 정의 안됨 없는거임










   //////////////////////////////////////////////////////

   res.render('detail', {
      detail_contttt: {
         'title': result.rows[0][2],
         'id': result.rows[0][0],
         'author': result.rows[0][1],
         'contents': result.rows[0][3],
         'date' :  result.rows[0][6]
      },
      // post: post,
      comments: comments,
      userName :userName,
      userId : userId,
      userRealName : userRealName


   })
});



app.get('/addComment', (req, res) => {
   const postId = req.query.post_id; // postId 가져오기
   const userId = req.session.loggedInUserId
   const username = req.session.username
   const userRealName = req.session.loggedRealName
   res.render('addComment',{postId: postId, userId:userId, userName:username, userRealName:userRealName});
});
app.post('/addComment', async (req, res) => {
   // 로그인 여부 확인
   if (!req.session.loggedIn) {
      return res.redirect('/login'); // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
   }

   const post_id  = req.body.post_id;
   const author_id = req.session.loggedInUserId;
   const comment_id = req.body.comment_id; // req.body에서 comment_id를 가져옴
   const { content } = req.body;
   console.log('댓글달리는거확인용')
   console.log(post_id)
   console.log(comment_id)

   let conn;
   try {
      conn = await oracledb.getConnection(dbConfig);

      // 댓글 추가
      await conn.execute(
          `INSERT INTO review_comments (id, post_id, author_id, content, parent_comment_id) 
             VALUES (review_comments_id_seq.nextval, :post_id, :author_id, :content, :parent_id)`, // parend_id를 parent_id로 수정
          [post_id, author_id, content, comment_id]
      );

      await conn.commit();

      res.redirect(`/detailPage/${post_id}`);
   } catch (err) {
      console.error(err);
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

////////////댓글 삭제/////////////
app.post('/deleteComment/:id', async (req, res) => {
   // 로그인 여부 확인
   if (!req.session.loggedIn) {
      return res.redirect('/login'); // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
   }

   const commentId = req.params.id;
   const postId = req.body.post_id;

   let conn;
   try {
      conn = await oracledb.getConnection(dbConfig);

      // 댓글 삭제
      await conn.execute(
          `DELETE FROM review_comments WHERE id = :id OR parent_comment_id = :parent_comment_id`,
          { id: commentId, parent_comment_id: commentId }
      );

      // 변경 사항 커밋
      await conn.commit();

      // 삭제 후 상세 페이지로 리다이렉트
      res.redirect(`/detailPage/${postId}`);
   } catch (err) {
      console.error('댓글 삭제 중 오류 발생:', err);
      res.status(500).send('댓글 삭제 중 오류가 발생했습니다.');
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







/////////////////////////////////////////////////////////////////////

app.get('/writing', (req, res) => {
   res.render('writing',username=null )
});

app.post('/www', async (req, res) => {

   const {title, content} = req.body;
   const author_id = req.session.loggedInUserId
   console.log('author_id :' + author_id )
   console.log('title:' + title)
   let conn;
   try {
      conn = await oracledb.getConnection(dbConfig);

      const result = await conn.execute(
          `SELECT review_post_id_seq.NEXTVAL
           FROM DUAL`
      );
      const postId = result.rows[0][0];
      await conn.execute(
          `INSERT INTO review_posts (id, title, content,author_id)
           VALUES (:id, :title, :content ,:author_id)`,
          [postId, title, content ,author_id]


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
       'select * from review_posts where id = :id ',
       {'id': postId}
   )
   res.render('edit', {
      edit_conmnm: {
         'author': result.rows[0][1],
         'id': result.rows[0][0],
         'title': result.rows[0][2]

      }, username: null
   })
});
app.post('/editafter/:idpppp', async (req, res) => {
   const {title, content} = req.body;
   const postId = req.params.idpppp;
   let conn;
   try {
      conn = await oracledb.getConnection(dbConfig);

      await conn.execute(
          `UPDATE review_posts
           SET title = :title,
               content = :contentttttt
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
   console.log('삭제:'+ postId)
   // const userId = req.session.userId
   // const userName = req.session.username;
   // const userRealName = req.session.userRealName;
   // 위에  세개를 어디에 쓰는걸까???  나중에 쓸일이 생기겠지???
   // ㄴㅋㅋㅋ 몰루!

   let conn;
   try {
      conn = await oracledb.getConnection(dbConfig);

      // 게시글 삭제
      await conn.execute(
          `DELETE FROM review_posts WHERE id = :id`,
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


/////////////////////검색기능/////////////////////////

