$(document).ready(function () {
    // 获取验证码按钮点击事件
    $('#getCodeBtn').click(function () {
        var phone = $('#phone').val();
        var phoneRegex = /^1[3-9]\d{9}$/; // 简单的中国手机号验证正则表达式
        if (!phoneRegex.test(phone)) {
            $('#phoneError').show();
            return;
        } else {
            $('#phoneError').hide();
        }

        // 发送请求到后端获取验证码
        $.ajax({
            url: 'http://localhost:8080/user/send_code',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ phone: phone }),
            success: function (response) {
                if (response) {
                    swal({
                        title: "验证码已发送",
                        text: "验证码" + response[0]['random_code'],
                        icon: "success",
                        button: "确定"
                    })
                    console.log("验证码：", response[0]['random_code']);
                } else {
                    swal({
                        title: "验证码发送失败",
                        text: "请稍后再试",
                        icon: "error",
                        button: "确定"
                    })
                }
            },
            error: function () {
                swal({
                    title: "验证码发送失败",
                    text: "请稍后再试",
                    icon: "error",
                    button: "确定"
                })
            }
        });
    });

    // 表单验证规则（依赖于 jquery-validator.js）
    $("#registerForm").validate({
        rules: {
            username: {
                required: true,
                minlength: 3,
                maxlength: 50
            },
            phone: {
                required: true,
                minlength: 11,
                maxlength: 11
            },
            verification_code: {
                required: true,
                minlength: 4,
                maxlength: 6
            },
            password: {
                required: true,
                minlength: 6
            },
            role: {
                required: true
            }
        },
        messages: {
            username: {
                required: "请输入用户名",
                minlength: "用户名至少为3位",
                maxlength: "用户名最多为50位"
            },
            phone: {
                required: "请输入手机号",
                minlength: "手机号长度为11位",
                maxlength: "手机号长度为11位"
            },
            verification_code: {
                required: "请输入验证码",
                minlength: "验证码长度至少为4位",
                maxlength: "验证码长度最多为6位"
            },
            password: {
                required: "请输入密码",
                minlength: "密码长度至少为6位"
            },
            role: {
                required: "请选择一个角色"
            }
        }
    });

    // 注册表单提交事件
    $('#registerForm').on('submit', function (e) {
        e.preventDefault();  // 阻止默认表单提交
    
        var username = $('#username').val();
        var phone = $('#phone').val();
        var code = $('#verification_code').val();  // 获取验证码
        var password = $('#password').val();
        var role = $('#role').val();
        var valid = true;
    
        // 验证逻辑保持不变
        if (username.length < 3) {
            $('#usernameError').show();
            valid = false;
        } else {
            $('#usernameError').hide();
        }
    
        var phoneRegex = /^1[3-9]\d{9}$/;
        if (!phoneRegex.test(phone)) {
            $('#phoneError').show();
            valid = false;
        } else {
            $('#phoneError').hide();
        }
    
        if (code.length === 0) {
            $('#codeError').show();
            valid = false;
        } else {
            $('#codeError').hide();
        }
    
        if (role === "") {
            $('#roleError').show();
            valid = false;
        } else {
            $('#roleError').hide();
        }

        if (password.length < 6) {
            $('#passwordError').show();
            valid = false;
        } else {
            $('#passwordError').hide();
        }
    
        // 如果验证不通过，停止表单提交
        if (!valid) {
            return;
        }

        // 对密码进行 MD5 加密
        password = md5Encrypt(password);

        // 获取头像文件
        var avatarFile = document.getElementById('avatarUpload').files[0];
        var formData = new FormData();
        formData.append('username', username);
        formData.append('phone', phone);
        formData.append('code', code);
        formData.append('password', password);
        formData.append('role', role);
        if (avatarFile) {
            formData.append('avatar', avatarFile);
        }
    
        // 请求后端创建用户
        $.ajax({
            url: 'http://localhost:8080/user/register',
            method: 'POST',
            contentType: false,  // 让 jQuery 不设置 Content-Type
            processData: false,  // 让 jQuery 不处理数据
            data: formData,
            success: function (response) {
                console.log(response);
                if (response.result === 'success') { 
                    swal({
                        title: "注册成功",
                        text: "欢迎加入我们！" + username,
                        icon: "success",
                        button: "确定"
                    }).then((value) => {
                        if (value) {
                            console.log("value:", value);
                            window.location.href = "/login.html";
                        }
                    } );
                } else {
                    swal({
                        title: "注册失败",
                        text: "原因： "+response.error+" 请尝试重新输入信息",
                        icon: "error",
                        button: "确定"
                    })
                    // 显示错误信息
                }
            },
            error: function (xhr, status, error) {
                // 解析错误响应内容
                let errorMessage = "请求失败，请稍后再试";
                
                // 如果后端返回了详细的错误信息
                if (xhr.responseJSON && xhr.responseJSON.error) {
                    errorMessage = xhr.responseJSON.error;
                } else if (xhr.responseText) {
                    errorMessage = xhr.responseText;
                }
                
                // 向用户展示错误信息
                swal({
                    title: "注册失败",
                    text:  "原因： "+xhr.responseJSON.error+" 请尝试重新输入信息", 
                    icon: "error",
                    button: "确定"
                })
                
                // 控制台日志（用于调试）
                console.error("Error details:", error);
                console.error("Response Text:", xhr.responseText);
            }
        });
    });
});

// MD5加密方法
function md5Encrypt(data) {
    return CryptoJS.MD5(data).toString();
}

// 点击头像区域上传文件
document.querySelector('.avatar-wrapper').addEventListener('click', function() {
    document.getElementById('avatarUpload').click();
});

// 显示上传的头像预览
document.getElementById('avatarUpload').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('avatar').src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});
