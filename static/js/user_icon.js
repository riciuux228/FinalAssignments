function set_user_icon() {
    // 假设用户已登录，token已存储在 localStorage 中
    var user = JSON.parse(localStorage.getItem('user'));  // 先取出并解析存储的 'user' 对象
    if (user && user.token) {
        var token = user.token;  // 从 'user' 对象中提取 token
        console.log("user_icon.js");
        console.log("token:", token);
        console.log("user:", user);
        getUserInfo(user.user_id,token);  // 调用获取用户信息的函数
        $('#login_or_usercent').attr('href', 'usercent.html');
    } else {
        // 设置用户图标
        $('#avatar').attr('src', 'static/image/user-icon.png');
        $('#login_or_usercent').attr('href', 'login.html');
    }
   
}

$(document).ready(function () {
    set_user_icon();
});

// 根据user_id获取用户信息
function getUserInfo(user_id,token) {
    $.ajax({
        url: 'http://localhost:8080/user/user_info/' + user_id,
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
