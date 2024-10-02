$(document).ready(function () {
    // 假设用户已登录，token已存储在 localStorage 中
    var user = JSON.parse(localStorage.getItem('user'));  // 先取出并解析存储的 'user' 对象
    if (user && user.token) {
        var token = user.token;  // 从 'user' 对象中提取 token
        console.log("userinfo.js");
        console.log("token:", token);
        console.log("user:", user);
        getUserInfo(user.user_id, token);  // 调用获取用户信息的函数
        checkPermission(user.user_id, token);  // 检查用户权限
    } else {
        console.log("未找到 token，请先登录");
        // 可以根据情况重定向到登录页面
        window.location.href = "/login.html";
    }
});

// 根据user_id获取用户信息
function getUserInfo(user_id, token) {
    $.ajax({
        url: 'http://localhost:8080/user/user_info/' + user_id,
        type: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'  // 确保请求头正确
        },
        success: function (data) {
            console.log(data);
            // username phone register-date user-role
            $('#username').text(data.username);
            $('#phone').text(data.phone);
            // Sat, 28 Sep 2024 21:24:58 GMT -> 2024-09-28
            $('#register-date').text(timestampToTime(data.created_at));
            $('#avatar').attr('src', data.user_icon_url);  // 显示头像
            // visitor or admin or user 替换为中文
            if (data.role === 'author') {
                $('#user-role').text('作者');
            } else if (data.role === 'admin') {
                $('#user-role').text('管理员');
            } else {
                $('#user-role').text('普通用户');
            }
        },
        error: function (error) {
            console.log('Error fetching user info:', error);
            swal({
                title: "获取用户信息失败",
                text: "请稍后再试",
                icon: "error",
                button: "确定"
            });
        }
    });
}

// 检查是否有权限
function checkPermission(user_id, token) {
    $.ajax({
        url: 'http://localhost:8080/user/check_permissions/' + user_id,
        type: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'  // 确保请求头正确
        },
        success: function (data) {
            if (data.result === 'user') {
                console.log('当前用户是普通用户');
                $('#articles-container').html('<p class="text-center">没有文章</p>');  // 显示没有文章
                hidePaginationButtons();  // 隐藏分页按钮
            } else if (data.result === 'author' || data.result === 'admin') {
                console.log('当前用户是作者或管理员');
                getArticleList(user_id, token);  // 获取作者的所有文章
            }
        },
        error: function (error) {
            console.log('Error checking permission:', error);

            swal({
                title: "检查权限失败",
                text: "请稍后再试",
                icon: "error",
                button: "确定"
            });
        }
    });
}

// 根据user_id 获取作者所有文章
function getArticleList(user_id, token) {
    $.ajax({
        url: 'http://localhost:8080/user/get_author_articles/' + user_id,
        type: 'GET',
        headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        success: function (data) {
            console.log("data:", data);
            if (data.length === 0) {
                $('#articles-container').html('<p class="text-center">暂无文章</p>');
                hidePaginationButtons();  // 隐藏分页按钮
            } else {
                displayArticles(data, 1);  // 显示第一页的文章
                setupPagination(data);  // 设置分页
            }
        },
        error: function (error) {
            console.log('Error fetching articles:', error);
            swal({
                title: "获取文章失败",
                text: "请稍后再试",
                icon: "error",
                button: "确定"
            });
        }
    });
}

// 显示文章
function displayArticles(articles, page) {
    const articlesPerPage = 6;
    const start = (page - 1) * articlesPerPage;
    const end = start + articlesPerPage;
    const articlesToDisplay = articles.slice(start, end);

    $('#articles-container').empty();

    // 如果没有文章则显示"暂无文章"
    if (articlesToDisplay.length === 0) {
        $('#articles-container').html('<p class="text-center">暂无文章</p>');
        hidePaginationButtons(); // 隐藏分页按钮
        return;
    }

    articlesToDisplay.forEach(article => {
        const base_url = "blog-detail-1.html?aid=";
        const articleCard = `
            <div class="col-md-6">
                <div class="card mb-4 shadow-sm">
                    <img src="${article.image_url}" class="card-img-top" alt="文章图片">
                    <div class="card-body">
                        <h5 class="card-title">${article.title}</h5>
                        <p class="card-text">${article.description}</p>
                        <a href="${base_url + article.aid}" class="btn btn-primary">阅读更多</a>
                    </div>
                </div>
            </div>
        `;
        $('#articles-container').append(articleCard);
    });
}

// 设置分页
function setupPagination(articles) {
    const articlesPerPage = 6;
    const totalPages = Math.ceil(articles.length / articlesPerPage);
    let currentPage = 1;

    // 如果文章总数少于或等于每页显示的数量，隐藏分页按钮
    if (totalPages <= 1) {
        hidePaginationButtons();
    } else {
        showPaginationButtons(); // 显示分页按钮
        $('#prev-page').prop('disabled', currentPage === 1);
        $('#next-page').prop('disabled', currentPage === totalPages);

        $('#prev-page').off('click').on('click', function () {
            if (currentPage > 1) {
                currentPage--;
                displayArticles(articles, currentPage);
                $('#prev-page').prop('disabled', currentPage === 1);
                $('#next-page').prop('disabled', currentPage === totalPages);
            }
        });

        $('#next-page').off('click').on('click', function () {
            if (currentPage < totalPages) {
                currentPage++;
                displayArticles(articles, currentPage);
                $('#prev-page').prop('disabled', currentPage === 1);
                $('#next-page').prop('disabled', currentPage === totalPages);
            }
        });
    }
}

// 隐藏分页按钮
function hidePaginationButtons() {
    $('#prev-page').hide();
    $('#next-page').hide();
}

// 显示分页按钮
function showPaginationButtons() {
    $('#prev-page').show();
    $('#next-page').show();
}

// 时间戳转换函数
function timestampToTime(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}年${month}月${day}日`;
}

// 退出登录
$('#logout').on('click', function () {
    localStorage.removeItem('user');  // 清除 localStorage 中的 'user' 对象
    console.log('已退出登录');
    window.location.href = '/login.html';  // 重定向到登录页面
});

// 点击头像区域上传文件
document.querySelector('.avatar-wrapper').addEventListener('click', function () {
    document.getElementById('avatarUpload').click();
});

// 显示上传的头像预览
document.getElementById('avatarUpload').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById('avatar').src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});
