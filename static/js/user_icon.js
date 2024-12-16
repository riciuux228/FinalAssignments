function set_user_icon() {
    var user = JSON.parse(localStorage.getItem('user'));  // 获取并解析存储的 'user' 对象
    if (user && user.token && !isTokenExpired(user.token)) {
        var token = user.token;
        console.log("user_icon.js");
        console.log("token:", token);
        console.log("user:", user);
        getUserInfo(user.user_id, token);  // 调用获取用户信息的函数
        $('#login_or_usercent').attr('href', 'usercent.html');
    } else {
        // token 过期或不存在，清除用户信息并重定向至登录页面
        localStorage.removeItem('user');
        $('#avatar').attr('src', 'static/image/user-icon.png');
        $('#login_or_usercent').attr('href', 'login.html');
    }
}


$(document).ready(function () {
    set_user_icon();
});

// 根据user_id获取用户信息
function getUserInfo(user_id, token) {
    $.ajax({
        url: `${API_BASE_URL}/user/user_info/${user_id}`,
        type: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'  // 确保请求头正确
        },
        success: function (data) {
            console.log(data);
            $('#avatar').attr('src', data.user_icon_url);  // 显示头像
        },
        error: function (error) {
            console.log('Error fetching user info:', error);

        }
    });
}

// 检查 token 是否已过期 
function isTokenExpired(token) {
    const payloadBase64 = token.split('.')[1];  // token 由三部分组成，第二部分是 payload
    const payload = JSON.parse(atob(payloadBase64));  // base64 解码 payload
    const currentTime = Math.floor(Date.now() / 1000);  // 当前时间戳（以秒为单位）

    // 检查 token 是否已过期
    return payload.exp < currentTime;
} 1
