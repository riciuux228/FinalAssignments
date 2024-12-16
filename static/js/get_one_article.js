$(document).ready(function () {
    // 获取url中的aid
    const urlParams = new URLSearchParams(window.location.search);
    const aid = urlParams.get('aid');
    if (aid) {
        console.log('文章ID: ' + aid);
        // 并行获取文章详情和更新点击量
        getPrevAndNextArticles(aid);
        getArticleDetail(aid);
        updateClick(aid);
        getCategoryCount();
        getRecentArticles();
        getArticleAttachments(aid);
        generateQRCode(aid);
    } else {
        console.error('URL中未找到文章ID');
    }

});

// 根据aid获取文章详情
function getArticleDetail(aid) {
    $.ajax({
        url: API_BASE_URL + `/article/article_id/${aid}`,
        type: 'GET',
        timeout: 5000,
        success: function (data) {
            console.log('文章详情获取成功:', data);
            updateArticleDetail(data);
        },
        error: function (error) {
            console.error('获取文章详情时发生错误:', error);
            swal({
                title: "无法获取文章详情",
                text: "请稍后再试。",
                icon: "error",
                button: "确定"
            })
        }
    });
}

// 更新文章详情
function updateArticleDetail(data) {
    replaceLocalhostWithIp(data.image_url, function (updatedUrl) {
        $('#article_img').attr('src', updatedUrl);
    });

    // $('#article_img').attr('src', replaceLocalhostWithIp(data.image_url));
    // console.log('文章图片:', data.image_url);
    // console.log('更新后的文章图片:', replaceLocalhostWithIp(data.image_url));
    $('#article_title').text(data.title);
    $('#article_author').text(data.author);
    $('#data-auth').text(timestampToTime(data.addtime));
    $('#click_count').text(data.click);
    $('#comment_count').text(data.comment_count);
    updateParagraphs(data.content);

    // 渲染关键词
    updateKeywords(data.keywords);
}

// 更新段落内容为富文本
function updateParagraphs(content) {
    // 假设 content 是富文本的内容，直接插入到页面中
    const articleContentDiv = document.querySelector('.article_content');

    // 清空现有的内容
    articleContentDiv.innerHTML = '';

    // 动态插入新的富文本内容
    articleContentDiv.innerHTML = content;
}

// 处理并更新关键词
function updateKeywords(keywords) {
    const keywordArray = keywords.split(',');
    console.log('关键词数组:', keywordArray);
    $('#main-keyword').text(keywordArray[0]);
    const $keywordList = $('.list-unstyled');
    $keywordList.empty();

    keywordArray.forEach(keyword => {
        $keywordList.append(`<li><a href="#${keyword}">${keyword}</a></li>`);
    });
}

// 获取分类和文章数量
function getCategoryCount() {
    $.ajax({
        url: API_BASE_URL + `/article/categories_with_count`,
        type: 'GET',
        timeout: 5000,
        success: function (data) {
            if (data && Array.isArray(data)) {
                console.log('分类和文章数量获取成功:', data);
                updateCategoryCount(data);
            } else {
                console.error('返回的数据格式无效:', data);
            }
        },
        error: function (error) {
            console.error('获取分类和文章数量时发生错误:', error);
            swal({
                title: "无法获取分类数据",
                text: "请稍后再试。",
                icon: "error",
                button: "确定"
            })

        }
    });
}

// 更新分类文章数量
function updateCategoryCount(categories) {
    categories.slice(0, 4).forEach(category => {
        $(`#category_name${category.cid}`).text(category.category_name);
        $(`#category-${category.cid}`).text(category.article_count);
        $(`#category_link${category.cid}`).attr('href', `blog-grid-1.html?cid=${category.cid}`);
    });
}

// 时间戳转换函数
function timestampToTime(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}年${month}月${day}日`;
}

// 更新点击量
function updateClick(article_id) {
    $.ajax({
        url: API_BASE_URL + `/article/update_click/${article_id}`,
        type: 'POST',
        timeout: 5000,
        success: function (data) {
            console.log('点击量更新成功:', data);
        },
        error: function (error) {
            console.error('更新点击量时发生错误:', error);
        }
    });
}

// 获取上一篇和下一篇文章的标题和图片
function getPrevAndNextArticles(aid) {
    $.ajax({
        url: API_BASE_URL + `/article/get_prev_next/${aid}`,
        type: 'GET',
        timeout: 5000,
        success: function (data) {
            try {
                // 检查并解析上一篇文章
                if (data.prev) {
                    // 解析 JSON 字符串为对象
                    var prev = data.prev;
                    $('#pre_title').text(prev.title);
                    replaceLocalhostWithIp(data.prev.image_url, function (updatedUrl) {
                        $('#pre_img').attr('src', updatedUrl).addClass('article-image');
                    });
                    if (prev.title == '没有上一篇文章') {
                        $('#pre_btn').attr('href', '#');
                    } else {
                        $('#pre_btn').attr('href', `blog-detail-1.html?aid=${prev.aid}`);
                        console.log('上一篇文章:', prev);
                    }
                } else {
                    $('#pre_title').text('没有上一篇文章');
                    $('#pre_img')
                        .attr('src', '默认图片路径')
                        .addClass('article-image'); // 添加 CSS 类
                    if (prev.title == '没有上一篇文章') {
                        $('#pre_btn').attr('href', '#');
                    } else {
                        $('#pre_btn').attr('href', '#');
                    }
                }

                // 检查并解析下一篇文章
                if (data.next) {
                    // 解析 JSON 字符串为对象
                    var next = data.next;
                    $('#next_title').text(next.title);
                    replaceLocalhostWithIp(data.next.image_url, function (updatedUrl) {
                        $('#next_img').attr('src', updatedUrl).addClass('article-image');
                    });
                    if (next.title == '没有下一篇文章') {
                        $('#next_btn').attr('href', '#');
                    } else {
                        $('#next_btn').attr('href', `blog-detail-1.html?aid=${next.aid}`);
                        console.log('下一篇文章:', next);
                    }
                } else {
                    $('#next_title').text('没有下一篇文章');
                    $('#next_img')
                        .attr('src', '默认图片路径')
                        .addClass('article-image'); // 添加 CSS 类
                    if (next.title == '没有下一篇文章') {
                        $('#next_btn').attr('href', '#');
                    } else {
                        $('#next_btn').attr('href', '#');
                    }
                }
            } catch (e) {
                console.error('解析上一篇和下一篇文章数据时发生错误:', e);
                // 你可以在这里添加更多的错误处理逻辑，比如显示错误消息给用户
            }
        },
        error: function (error) {
            console.error('获取上一篇和下一篇文章时发生错误:', error);
        }
    });
}

// 获取最近发布的三篇文章
function getRecentArticles() {
    $.ajax({
        url: API_BASE_URL + `/article/get_recent_articles`,
        type: 'GET',
        success: function (data) {
            // 检查数据是否成功返回
            if (data.success && Array.isArray(data.data)) {
                var recent_articles = data.data;
                console.log('最近发布的文章:', recent_articles);
                for (let i = 0; i < recent_articles.length; i++) {
                    var article = recent_articles[i];

                    // 设置文章链接
                    $('#recently_article' + (i + 1)).attr('href', 'blog-detail-1.html?aid=' + article.aid);

                    // 设置文章图片
                    console.log('最近更新文章的图片路径:', article.image_url);
                    replaceLocalhostWithIp(article.image_url, function (updatedUrl) {
                        $('#recently_img' + (i + 1)).attr('src', updatedUrl).css({
                            'width': '120px',
                            'height': '94px',
                            'object-fit': 'cover',
                            'display': 'block' // 确保图片以块级元素显示，防止布局问题
                        });
                        console.log('更新后最近更新文章的图片路径:', updatedUrl);
                    });

                    // 时间处理：Fri, 27 Sep 2024 16:23:10 GMT 转换为 2024年9月27日
                    var date = timestampToTime(article.update_time);
                    $('#update_time_cid' + (i + 1)).text(date);

                    // 设置文章标题
                    $('#recently_article_title' + (i + 1)).text(article.title);
                }
            } else {
                console.error('获取的文章数据格式不正确:', data);
            }
        },
        error: function (error) {
            console.log('Error fetching recent articles:', error);
        }
    });
}

// 展开/收起评论
function toggleReplies(commentId) {
    const repliesElement = document.getElementById(`replies-${commentId}`);
    const toggleButton = document.querySelector(`[onclick="toggleReplies(${commentId})"]`);

    if (repliesElement.style.display === 'none') {
        repliesElement.style.display = 'block';
        toggleButton.innerText = '收起回复';
    } else {
        repliesElement.style.display = 'none';
        toggleButton.innerText = '展开回复';
    }
}

// 动态加载更多回复的示例函数
function loadMoreReplies(commentId, repliesArray) {
    const repliesElement = document.getElementById(`replies-${commentId}`);

    repliesArray.forEach(reply => {
        const newReply = document.createElement('div');
        newReply.classList.add('comment', 'reply');
        newReply.innerHTML = `
            <img class="avatar" src="${reply.avatar}" alt="Avatar">
            <div class="comment-body">
                <span class="username">${reply.username}</span>
                <span class="comment-date">${reply.date}</span>
                <p class="comment-content">回复 <strong>${reply.replyTo}</strong>：${reply.content}</p>
            </div>
        `;
        repliesElement.appendChild(newReply);
    });
}

// 获取文章附件并回显
function getArticleAttachments(articleId) {
    $.ajax({
        url: API_BASE_URL + `/article/get_attachments/${articleId}`,
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

// 删除附件
function deleteAttachment(attachmentId) {
    $.ajax({
        url: API_BASE_URL + `/delete_attachment/${attachmentId}`,
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


// 生成分享二维码
function generateQRCode(articleId) {
    const port = window.location.port;
    console.log("当前端口号:", port);
    $.ajax({
        url: API_BASE_URL + `/article/get_local_ip`,
        type: 'GET',
        success: function (data) {
            console.log('本地IP:', data.local_ip);
            // 拼接本地IP和端口号和文章详情页路径
            const localIp = data.local_ip;
            const articleBaseUrl = `http://${localIp}:${port}/blog-detail-1.html?aid=${articleId}`;

            // 生成二维码
            new QRCode(document.getElementById("qrcode"), {
                text: articleBaseUrl,
                width: 300,
                height: 300,
                colorDark: "#000000",  // 二维码前景色
                colorLight: "#ffffff",  // 二维码背景色
            });
        },
        error: function (error) {
            console.error('获取本地IP失败:', error);
        }
    });
}

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
