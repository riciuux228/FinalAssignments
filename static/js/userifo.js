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
        fillCategorySelect();  // 填充分类下拉框
    } else {
        console.log("未找到 token，请先登录");
        window.location.href = "/login.html";
    }
});

// 填充分类下拉框
function fillCategorySelect() {
    // 获取分类数据并填充下拉框
    $.ajax({
        url: `${API_BASE_URL}/article/category_id`, // 后端获取分类数据的API
        type: 'GET',
        success: function (categories) {
            var categorySelect = $('#articleCategory');
            categories.forEach(function (category) {
                // 创建一个新的选项并添加到下拉框中
                var option = `<option value="${category.cid}">${category.category_name}</option>`;
                categorySelect.append(option);
            });
        },
        error: function (error) {
            console.error('获取分类失败:', error);
            swal({
                title: "获取分类失败",
                text: "请稍后再试",
                icon: "error",
                button: "确定"
            });
        }
    });


}

// 根据user_id获取用户信息
function getUserInfo(user_id, token) {
    $.ajax({
        url: `${API_BASE_URL}/user/user_info/${user_id}`,
        type: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        success: function (data) {
            $('#username').text(data.username);
            $('#phone').text(data.phone);
            $('#register-date').text(timestampToDate(data.created_at));
            $('#avatar').attr('src', data.user_icon_url);

            if (data.role === 'author') {
                $('#user-role').text('作者');
            } else if (data.role === 'admin') {
                $('#user-role').text('管理员');
            } else {
                $('#user-role').text('普通用户');
            }
        },
        error: function (error) {
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
        url: `${API_BASE_URL}/user/check_permissions/${user_id}`,
        type: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        success: function (data) {
            if (data.result === 'user') {
                $('#articles-table-body').html('<tr><td colspan="7" class="text-center">没有文章</td></tr>');
            } else if (data.result === 'author' || data.result === 'admin') {
                getArticleList(user_id, token);
            }
        },
        error: function (error) {
            swal({
                title: "检查权限失败",
                text: "请稍后再试",
                icon: "error",
                button: "确定"
            });
        }
    });
}

// 获取文章列表
function getArticleList(user_id, token) {
    $.ajax({
        url: API_BASE_URL + '/user/get_author_articles/' + user_id,
        type: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        success: function (data) {
            if (data.length === 0) {
                $('#articles-table-body').html('<tr><td colspan="7" class="text-center">暂无文章</td></tr>');
            } else {
                renderArticleTable(data);
            }
        },
        error: function (error) {
            swal({
                title: "获取文章失败",
                text: "请稍后再试",
                icon: "error",
                button: "确定"
            });
        }
    });
}

// 渲染文章表格
function renderArticleTable(articles) {
    let rows = '';
    articles.forEach(article => {
        rows += `
            <tr id="article-${article.aid}">
                <td>${article.aid}</td>
                <td>${article.category_name}</td>
                <td>${article.title}</td>
                <td>${timestampToDate(article.update_time)}</td>
                <td>
                    <button class="btn btn-primary btn-sm edit-article" data-id="${article.aid}">编辑</button>
                    <button class="btn btn-danger btn-sm delete-article" data-id="${article.aid}">删除</button>
                </td>
            </tr>
        `;
    });
    $('#articles-table-body').html(rows);

    // 绑定编辑按钮事件
    $('.edit-article').on('click', function () {
        const articleId = $(this).data('id');
        editArticle(articleId);
    });

    // 绑定删除按钮事件
    $('.delete-article').on('click', function () {
        const articleId = $(this).data('id');
        deleteArticle(articleId);
    });
}

// 删除文章
function deleteArticle(articleId) {
    var user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.token) {
        swal({
            title: "请先登录",
            text: "未找到用户信息",
            icon: "warning",
            button: "确定"
        });
        return;
    }

    $.ajax({
        url: `${API_BASE_URL}/article/delete_article/${articleId}`,
        type: 'POST',
        headers: {
            'Authorization': 'Bearer ' + user.token,
            'Content-Type': 'application/json'
        },
        success: function () {
            $(`#article-${articleId}`).remove();
            swal({
                title: "删除成功",
                text: "文章已删除",
                icon: "success",
                button: "确定"
            });
        },
        error: function (error) {
            swal({
                title: "删除失败",
                text: "请稍后再试",
                icon: "error",
                button: "确定"
            });
        }
    });
}

// 时间戳转换函数
function timestampToDate(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
}

// 处理文章编辑，包括封面图片、附件上传和预览
function editArticle(articleId) {
    $.ajax({
        url: `${API_BASE_URL}/article/article_id/${articleId}`,
        type: 'GET',
        success: function (article) {
            $('#articleId').val(article.aid);
            $('#articleTitle').val(article.title);
            $('#articleTags').val(article.keywords);
            $('#articleDescription').val(article.description);
            $('#articleCategory').val(article.cid);  // 设置分类下拉框选中项    
            console.log('文章内容:', article);  // 打印文章内容
            editorInstance.setData(article.content);
            loadExistingAttachments(article.aid);

            // 加载文章的封面图片（假设服务器返回的封面图片URL字段为cover_image_url）
            if (article.image_url) {
                $('#coverImagePreview').html(`<img src="${article.image_url}" alt="封面预览" style="max-width: 100%; height: auto;">`);
            } else {
                $('#coverImagePreview').empty();  // 如果没有封面图片，清空预览
            }

            $('button[type="submit"]').text('更新文章');
        },
        error: function (error) {
            swal("错误", "获取文章失败", "error");
        }
    });
}


function loadExistingAttachments(articleId) {
    $.ajax({
        url: `${API_BASE_URL}/article/get_attachments/${articleId}`,
        type: 'GET',
        success: function (attachments) {
            console.log('附件列表:', attachments);  // 打印获取到的附件数据
            $('#existing-attachments').empty();  // 清空之前的附件列表
            attachments.forEach(attachment => {
                const attachmentRow = `
                    <div id="attachment-${attachment.id}" class="attachment-item">
                        <a href="${attachment.attachment_url}" target="_blank">${decodeURIComponent(attachment.attachment_name)}</a>
                        <span> (${Math.round(attachment.size / 1024)} KB)</span>
                        <button type="button" class="btn btn-danger btn-sm delete-attachment" data-id="${attachment.id}">删除</button>
                    </div>
                `;
                $('#existing-attachments').append(attachmentRow);
            });

            // 绑定删除按钮事件
            $('.delete-attachment').on('click', function () {
                const attachmentId = $(this).data('id');
                deleteAttachment(attachmentId);
            });
        },
        error: function (error) {
            console.log('获取附件失败:', error);  // 打印错误信息
            swal("错误", "无法获取附件列表", "error");
        }
    });
}


// 删除附件
function deleteAttachment(attachmentId) {
    $.ajax({
        url: `${API_BASE_URL}/delete_attachment/${attachmentId}`,
        type: 'DELETE',
        success: function (response) {
            // 从 DOM 中移除附件条目
            $(`#attachment-${attachmentId}`).remove();
            swal("成功", "附件已删除", "success");
        },
        error: function (error) {
            swal("错误", "删除附件失败", "error");
        }
    });
}


// 处理发布或更新文章的表单提交
$('#articleForm').on('submit', function (e) {
    e.preventDefault();

    const aid = $('#articleId').val();  // 文章ID
    const title = $('#articleTitle').val();  // 标题
    const keywords = $('#articleTags').val();  // 关键词
    const description = $('#articleDescription').val();  // 描述
    const content = editorInstance.getData();  // 从 CKEditor 获取富文本内容
    var categoryId = $('#articleCategory').val(); // 获取选中的分类ID

    const formData = new FormData();
    formData.append('aid', aid);  // 如果存在ID，表示更新文章
    formData.append('title', title);
    formData.append('keywords', keywords);
    formData.append('description', description);
    formData.append('content', content);
    formData.append('category_id', categoryId);

    // 处理封面图片上传
    const coverImage = $('#coverImage')[0].files[0];
    if (coverImage) {
        formData.append('coverImage', coverImage);  // 将封面图片添加到 formData
    }

    // 处理附件上传
    const files = $('#attachments')[0].files;
    for (let i = 0; i < files.length; i++) {
        formData.append('attachments[]', files[i]);
    }

    const url = aid ? `${API_BASE_URL}/article/update_article` : '${API_BASE_URL}/article/add_article';

    $.ajax({
        url: url,
        type: 'POST',
        data: formData,
        processData: false,  // 不要处理数据
        contentType: false,  // 不要设置内容类型
        headers: {
            Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user')).token
        },
        success: function (response) {
            swal("成功", aid ? "文章已成功更新" : "文章已成功发布", "success");
            $('#articleForm')[0].reset();  // 重置表单
            editorInstance.setData('');  // 清空 CKEditor 内容
            $('#articleId').val(''); // 清空文章ID
            $('#attachment-preview').empty(); // 清空附件预览
            $('#existing-attachments').empty(); // 清空已存在的附件
            $('#coverImagePreview').empty(); // 清空封面图片预览
            // 重新加载文章列表
            var user = JSON.parse(localStorage.getItem('user'));
            getArticleList(user.user_id, user.token);
        },
        error: function (error) {
            swal("错误", aid ? "文章更新失败" : "文章发布失败", "error");
        }
    });
});


// CKEditor 初始化
let editorInstance;
ClassicEditor
    .create(document.querySelector('#articleContent'))
    .then(editor => {
        editorInstance = editor;
    })
    .catch(error => {
        console.error(error);
    });

// 处理封面图片预览功能
$('#coverImage').on('change', function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            $('#coverImagePreview').html(`<img src="${e.target.result}" alt="封面预览" style="max-width: 100%; height: auto;">`);
        };
        reader.readAsDataURL(file);
    } else {
        $('#coverImagePreview').empty();  // 如果没有选择图片，清空预览
    }
});


// 处理附件预览功能
$('#attachments').on('change', function () {
    const files = this.files;
    $('#attachment-preview').empty();  // 清空之前的预览
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileRow = `
            <div class="attachment-item">
                <span>${file.name} (${Math.round(file.size / 1024)} KB)</span>
                <button type="button" class="btn btn-danger btn-sm remove-attachment" data-index="${i}">删除</button>
            </div>
        `;
        $('#attachment-preview').append(fileRow);
    }

    // 绑定删除按钮事件
    $('.remove-attachment').on('click', function () {
        const index = $(this).data('index');
        removeAttachment(index);
    });
});

// 删除附件预览（前端处理未上传的附件）
function removeAttachment(index) {
    const files = $('#attachments')[0].files;
    const dataTransfer = new DataTransfer();
    for (let i = 0; i < files.length; i++) {
        if (i !== index) {
            dataTransfer.items.add(files[i]);
        }
    }
    $('#attachments')[0].files = dataTransfer.files;
    $('#attachment-preview').empty();  // 重新渲染附件预览
    for (let i = 0; i < dataTransfer.files.length; i++) {
        const file = dataTransfer.files[i];
        const fileRow = `
            <div class="attachment-item">
                <span>${file.name} (${Math.round(file.size / 1024)} KB)</span>
                <button type="button" class="btn btn-danger btn-sm remove-attachment" data-index="${i}">删除</button>
            </div>
        `;
        $('#attachment-preview').append(fileRow);
    }
}

// 退出登录
$('#logout').on('click', function () {
    localStorage.removeItem('user');  // 清除 localStorage 中的 'user' 对象
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

