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

app.post('/test',(req,res)=>{
   console.log(req.body)
} );

////////////////////////////////////
// db와 연결해서 post로 받은 값고 비교 하는것 해봄
//3가지를 깔아야하는듯..세션이랑 passport랑
// 그전에 우선오라클과먼저 연결 다시

const dbConfig = require('./dbconfig');
const oracledb = require("oracledb");
oracledb.autoCommit = true;
oracledb.initOracleClient({ libDir: '../instantclient_21_13' });

//위에가 필수 쿼리 아래는 확인 쿼리
async function selectDatabase222() {

   console.log("!!!!! db conenction !!!!!");

   let connection = await oracledb.getConnection(dbConfig);
   let binds = {};
   let options = {
      outFormat: oracledb.OUT_FORMAT_OBJECT   // query result format
   };
   console.log("!!!!! db select !!!!!");
   let result = await connection.execute("select * from webnovel", binds, options);

   //result에  데이터 내용을 담음

   console.log("!!!!! db response !!!!!");
   console.log(result.rows);
   console.log(result.rows[1]);
   console.log(result.rows[1].NAME)

   console.log("!!!!! db close !!!!!");
   await connection.close();

}

selectDatabase222();


// 위에 껄로 다시 확인 했음  나중에 함수는 지워도 됨