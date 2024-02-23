const express = require('express');
const app = express();

app.listen(3000,()=>{
   console.log('서버열림 : http://localhost:3000/webnovel')
});
app.get('/webnovel',(req,res)=>{
   res.sendFile(__dirname + '/lay_out10.html');
});
app.use(express.static('public'));


///////////////////

// npm i oracledb   로   설치하고
// instantclient_21_13  이파일을 넣음
// 내 데이터 베이스 접속 아디 비번  기입하는 dbconfig만들어놈


const oracledb = require('oracledb');
const dbConfig = require('./dbconfig');

oracledb.autoCommit = true;
//자동 커밋

oracledb.initOracleClient({ libDir: '../instantclient_21_13' });

//몬지 모름  몬가 연결 하는거겠지? 내가 넣은 파일이니까



async function selectDatabase() {

   console.log("!!!!! db conenction !!!!!");

   //await: 비동기 수행시 해당 명령어가 완료될때까지 기다려준느 키워드
   let connection = await oracledb.getConnection(dbConfig);
   let binds = {};
   let options = {
      outFormat: oracledb.OUT_FORMAT_OBJECT   // query result format
      // 쿼리의 결과가 객체 형식으러 변환
   };
   console.log("!!!!! db select !!!!!");
   let result = await connection.execute("select * from users", binds, options);

   console.log("!!!!! db response !!!!!");
   console.log(result.rows);
   console.log(result.rows[0]);
   // console.log(result.rows[0][3]);
   //위에는 배열일 경우
   console.log(result.rows[2].NAME)

   console.log("!!!!! db close !!!!!");
   await connection.close();

}









selectDatabase();