$(document).ready(function () {
    console.log("login.js");

    $("#loginForm").on('submit', function (e) {
        e.preventDefault();

        var username = $("#username").val();
        var init_password = $("#password").val();
        var password = md5Encrypt(init_password);

        $.ajax({
            url: API_BASE_URL + "/user/login",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                username: username,
                password: password
            }),
            success: function (res) {
                if (res.result === 'success') {
                    // 登录成功，保存用户信息到localStorage
                    localStorage.setItem('user', JSON.stringify({
                        username: res.username,
                        user_id: res.id,
                        token: res.token
                    }));
                    console.log("token:", res.token);
                    console.log("localStorage:", localStorage.getItem('user'));

                    swal({
                        title: "登录成功",
                        text: "欢迎回来，" + res.username,
                        icon: "success",
                        button: "确定"
                    }).then((value) => {
                        if (value) {
                            console.log("value:", value);
                            window.location.href = "/index.html";
                        }
                    });
                } else {
                    swal({
                        title: "登录失败",
                        text: "请尝试重新输入账号秘密",
                        icon: "error",
                        button: "确定"
                    })
                }
            },
            error: function (error) {
                swal({
                    title: "登录失败",
                    text: "请尝试重新输入账号秘密",
                    icon: "error",
                    button: "确定"
                })
                console.error("登录请求失败：", error);
            }
        });
    });

    // 表单验证规则
    $("#loginForm").validate({
        rules: {
            username: {
                required: true,
                minlength: 3,
                maxlength: 50
            },
            password: {
                required: true,
                minlength: 6
            }
        },
        messages: {
            username: {
                required: "请输入用户名",
                minlength: "用户名至少为3位",
                maxlength: "用户名最多为50位"
            },
            password: {
                required: "请输入密码",
                minlength: "密码长度至少为6位"
            }
        }
    });
});

// MD5加密函数
function md5Encrypt(data) {
    return CryptoJS.MD5(data).toString();
}
