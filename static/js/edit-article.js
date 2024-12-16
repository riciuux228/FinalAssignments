$(document).ready(function () {
    var user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
        var token = user.token;
        console.log("edit-article.js");
        console.log("token:", token);
        console.log("user:", user);

        // 获取文章id
        var url = window.location.href;
        var urlArr = url.split("?");
        var articleId = urlArr[1].split("=")[1];
        console.log("articleId:", articleId);

        // 获取文章并回显
        getArticle(articleId);
    } else {
        console.log("未找到 token，请先登录");
        window.location.href = "/login.html";
    }

    // 图片点击事件，点击图片时打开隐藏的文件选择控件
    $('#articleImage').click(function () {
        $('#uploadImage').click(); // 触发隐藏的文件选择控件
    });

    // 文件选择控件监听器，选择文件后实时显示图片预览
    $('#uploadImage').change(function () {
        var file = this.files[0]; // 获取选择的第一个文件
        if (file) {
            var reader = new FileReader();
            reader.onload = function (e) {
                $('#articleImage').attr('src', e.target.result); // 更新图片预览
            }
            reader.readAsDataURL(file); // 读取文件并将结果显示为图片
        }
    });

    // 创建一个数组来存储已选择的文件
    var selectedFiles = [];

    // 监听附件上传，显示文件列表
    $('#articleAttachment').change(function () {
        var files = this.files; // 获取当前选择的文件
        var filePreview = $('#filePreview');

        // 将新选择的文件添加到 selectedFiles 数组中
        for (var i = 0; i < files.length; i++) {
            selectedFiles.push(files[i]); // 添加到数组
        }

        // 生成文件预览
        generateFilePreview(filePreview);
    });

    // 生成文件预览
    function generateFilePreview(filePreview) {
        filePreview.empty(); // 清空之前的预览内容

        for (var i = 0; i < selectedFiles.length; i++) {
            var file = selectedFiles[i];
            var fileName = file.name;
            var fileSize = (file.size / 1024).toFixed(2) + ' KB'; // 文件大小，以KB显示

            // 创建预览HTML
            var previewHtml = `
                        <div style="display: flex; align-items: center; margin-bottom: 10px;" id="file-${i}">
                            <img src="https://bpic.588ku.com/element_origin_min_pic/19/04/09/f6ee1317a9bb3ef11258a0297a4cabe7.jpg" alt="file icon" style="width: 20px; height: 20px; margin-right: 10px;">
                            <a href="#" style="color: blue; text-decoration: underline;">${fileName}</a>
                            <span style="margin-left: 10px; color: green;">(${fileSize})</span>
                            <button type="button" class="btn-delete" data-index="${i}" style="margin-left: 10px; color: red;">删除</button>
                        </div>
                    `;

            // 如果是图片文件，生成缩略图
            if (file.type.startsWith('image/')) {
                var reader = new FileReader();
                reader.onload = (function (index) {
                    return function (e) {
                        var thumbnailHtml = `<img src="${e.target.result}" alt="缩略图" style="width: 50px; height: 50px; margin-left: 10px;">`;
                        $('#file-' + index).append(thumbnailHtml); // 添加缩略图到预览HTML
                    };
                })(i);
                reader.readAsDataURL(file); // 读取文件内容为Data URL
            }

            // 添加文件预览到预览区
            filePreview.append(previewHtml);
        }
    }

    // 监听删除按钮点击事件
    $(document).on('click', '.btn-delete', function () {
        var index = $(this).data('index');
        selectedFiles.splice(index, 1); // 从数组中删除文件

        // 重新生成文件预览
        generateFilePreview($('#filePreview'));
    });

    // 表单提交功能
    $('form').on('submit', function (e) {
        e.preventDefault(); // 阻止默认表单提交行为

        var formData = new FormData(this);
        formData.append('aid', articleId);
        formData.append('title', $('#articleTitle').val());
        formData.append('keywords', $('#articleTags').val());
        formData.append('content', $('#articleContent').val());
        formData.append('uphold_img', $('#uploadImage')[0].files[0]);  // 修改这里，使用 id 选择器
        formData.append('description', $('#articleDescription').val());

        // 将所有已选择的文件附加到 FormData 中
        for (var i = 0; i < selectedFiles.length; i++) {
            formData.append('attachments[]', selectedFiles[i]);  // 文件本身
            formData.append('attachment_names[]', selectedFiles[i].name);  // 文件名称
            formData.append('attachment_sizes[]', selectedFiles[i].size);  // 文件大小（以字节为单位）
        }
        console.log('aid:', formData.get('aid'));
        console.log('title:', formData.get('title'));
        console.log('keywords:', formData.get('keywords'));
        console.log('content:', formData.get('content'));
        console.log('attachments:', formData.getAll('attachments[]'));
        console.log('description:', formData.get('description'));
        // 提交表单数据
        var user = JSON.parse(localStorage.getItem('user'));

        $.ajax({
            url: `${API_BASE_URL}/article/update_article`,
            // 修改为实际的上传URL
            type: 'POST',
            headers: {
                'Authorization': 'Bearer ' + user.token
            },
            data: formData,
            contentType: false, // 不设置内容类型
            processData: false, // 不处理数据
            success: function (response) {
                console.log('上传成功', response);
                swal({
                    title: "更新成功",
                    text: "文章已更新",
                    icon: "success",
                    button: "确定"
                }).then(() => {
                    window.location.href = '/usercent.html';
                });
            },
            error: function (error) {
                console.log('上传失败', error);
                swal({
                    title: "更新失败",
                    text: "请稍后再试",
                    icon: "error",
                    button: "确定"
                });
            }
        });
    });

    // 获取文章回显
    function getArticle(articleId) {
        $.ajax({
            url: `${API_BASE_URL}/article/article_id/${articleId}`,
            type: 'GET',
            success: function (res) {
                console.log('Article:', res);
                // 将获取到的文章数据回显到表单
                $('#articleTitle').val(res.title); // 标题
                $('#articleTags').val(res.keywords); // 标签
                $('#articleContent').val(res.content); // 文章内容
                $('#articleDescription').val(res.description); // 文章描述
                getArticleAttachments(articleId); // 获取文章附件并回显
                // 显示文章图片
                if (res.image_url) {


                    replaceLocalhostWithIp(res.image_url, function (updatedUrl) {
                        $('#articleImage').attr('src', updatedUrl);
                    });
                }
            },
            error: function (error) {
                console.log("获取文章失败", error);
            }
        });
    }

    // 获取文章附件并回显
    function getArticleAttachments(articleId) {
        $.ajax({
            url: `${API_BASE_URL}/article/get_attachments/${articleId}`,
            type: 'GET',
            success: function (res) {
                console.log('Attachments:', res);
                var attachmentContainer = $('#existingAttachments');
                attachmentContainer.empty(); // 清空之前的附件显示

                if (res && res.length > 0) {
                    res.forEach(function (attachment, index) {
                        var fileName = attachment.attachment_name || `附件${index + 1}`;
                        var fileSize = (attachment.size / 1024).toFixed(2) + ' KB';  // 假设服务器返回的大小单位为字节
                        var fileUrl = attachment.attachment_url;

                        var attachmentHtml = `
                                    <div style="display: flex; align-items: center; margin-bottom: 10px;">
                                        <img src="https://bpic.588ku.com/element_origin_min_pic/19/04/09/f6ee1317a9bb3ef11258a0297a4cabe7.jpg" alt="file icon" style="width: 20px; height: 20px; margin-right: 10px;">
                                        <a href="${fileUrl}" target="_blank" style="color: blue; text-decoration: underline;">${fileName}</a>
                                        <span style="margin-left: 10px; color: green;">(${fileSize})</span>
                                        <button type="button" class="btn-delete-existing" data-id="${attachment.id}" style="margin-left: 10px; color: red;">删除</button>
                                    </div>
                                `;
                        attachmentContainer.append(attachmentHtml);
                    });
                } else {
                    attachmentContainer.append('<p>没有附件</p>');
                }
            },
            error: function (error) {
                console.log("获取附件失败", error);
            }
        });
    }

    // 监听删除已上传附件的按钮点击事件
    $(document).on('click', '.btn-delete-existing', function () {
        var attachmentId = $(this).data('id');
        var token = JSON.parse(localStorage.getItem('user')).token;
        var articleId = window.location.href.split("=")[1];
        console.log('删除附件ID:', attachmentId);
        if (confirm('确定要删除这个附件吗？')) {
            $.ajax({
                url: `${API_BASE_URL}/article/delete_attachment/${attachmentId}`,
                type: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + token
                },
                success: function (response) {
                    console.log('附件删除成功', response);
                    // 删除成功后，重新加载附件列表
                    getArticleAttachments(articleId);
                },
                error: function (error) {
                    console.log('附件删除失败', error);
                }
            });
        }
    });
});

function replaceLocalhostWithIp(url, callback) {
    $.ajax({
        url: API_BASE_URL + `/article/get_local_ip`,
        type: 'GET',
        success: function (data) {
            console.log('本地IP:', data.local_ip);
            // Replace localhost with the local IP
            const updatedUrl = url.replace('http://localhost:8080', `http://${data.local_ip}:8080`);
            callback(updatedUrl);
        },
        error: function (error) {
            console.error('获取本地IP失败:', error);
            callback(url); // Fallback to the original URL if IP fetch fails
        }
    });
}

