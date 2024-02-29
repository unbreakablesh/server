document.getElementById('loginForm').addEventListener('submit', function(event) {
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    // 비밀번호가 강력하지 않은 경우
    if (password.length < 8 ) {
        event.preventDefault(); // 폼 제출을 막음

        // 비밀번호가 강력하지 않을 때 사용자에게 메시지를 표시
        var message = document.createElement('p');
        message.textContent = '비밀번호는 최소 8자 이상이어야 합니다.';
        message.style.color = 'red';
        var form = document.getElementById('loginForm');
        form.appendChild(message);


    }
});
