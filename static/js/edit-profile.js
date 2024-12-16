$(document).ready(function () {
    var user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
        var token = user.token;
        console.log("edit-profile.js");
        console.log("token:", token);
        console.log("user:", user);

        // 获取用户信息并回显
        getUserInfo(user.user_id, token);
    } else {
        console.log("未找到 token，请先登录");
        window.location.href = "/login.html";
    }

    // 点击头像区域时，触发文件选择框
    $('.avatar-wrapper').off('click').on('click', function (e) {
        // 确保只触发文件选择框，而不会产生无限递归
        if (e.target.id !== 'avatarUpload') {
            $('#avatarUpload').trigger('click');
        }
    });

    // 显示上传的头像预览
    $('#avatarUpload').off('change').on('change', function (event) {
        var file = event.target.files[0];  // 读取选中的文件
        if (file) {
            var reader = new FileReader();
            reader.onload = function (e) {
                $('#avatarPreview').attr('src', e.target.result); // 更新头像预览
            }
            reader.readAsDataURL(file); // 显示图片
        }
    });

    // 表单提交功能
    $('#editProfileForm').on('submit', function (e) {
        e.preventDefault(); // 阻止默认表单提交行为
        var formData = new FormData(this);
        if ($('#username').val()) {
            formData.set('username', $('#username').val());
        }
        if ($('#password').val()) {
            formData.set('password', md5($('#password').val())); // 使用md5加密密码
        }
        if ($('#avatarUpload')[0].files[0]) {
            formData.set('user_icon', $('#avatarUpload')[0].files[0]);
        }
        updateUserProfile(user.user_id, token, formData);
    });
});

// 获取用户信息
function getUserInfo(userId, token) {
    $.ajax({
        url: `${API_BASE_URL}/user/user_info/${userId}`,
        type: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        success: function (data) {
            $('#username').val(data.username);
            if (data.user_icon_url) {
                $('#avatarPreview').attr('src', data.user_icon_url);
            }
        },
        error: function (error) {
            console.error("获取用户信息失败", error);
        }
    });
}

// 更新用户资料
function updateUserProfile(userId, token, formData) {
    $.ajax({
        url: `${API_BASE_URL}/user/update_profile`,
        type: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token
        },
        data: formData,
        processData: false,
        contentType: false,
        success: function (data) {
            swal(
                {
                    title: "更新成功",
                    text: "用户资料已更新",
                    icon: "success",
                    button: "确定"
                }
            ).then(() => {
                // 删除本地存储的用户信息
                localStorage.removeItem('user');
                window.location.href = '/login.html';
            }
            );
        },
        error: function (error) {
            console.error("更新用户资料失败", error);
            swal("错误", "用户资料更新失败", "error");
        }
    });
}