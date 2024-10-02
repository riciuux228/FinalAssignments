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
    } else {
        console.error('URL中未找到文章ID');
    }
   
});



// 根据aid获取文章详情
function getArticleDetail(aid) {
    $.ajax({
        url: `http://localhost:8080/article/article_id/${aid}`,
        type: 'GET',
        timeout: 5000,
        success: function (data) {
            console.log('文章详情获取成功:', data);
            updateArticleDetail(data);
        },
        error: function (error) {
            console.error('获取文章详情时发生错误:', error);
            alert('无法获取文章详情，请稍后再试。');
        }
    });
}

// 更新文章详情
function updateArticleDetail(data) {
    $('#article_img').attr('src', data.image_url);
    $('#article_title').text(data.title);
    $('#article_author').text(data.author);
    $('#data-auth').text(timestampToTime(data.addtime));
    $('#click_count').text(data.click);
    $('#comment_count').text(data.comment_count);
    $('#comment_counts').text(`${data.comment_count} 条评论`);

    if (data.comment_count === 0) {
        $('#comment_div').html('<div class="comment-item">暂无评论</div>');
    }

    // 动态分配段落内容
    const totalContent = data.content.replace(/\n/g, '');  // 去掉换行符
    updateParagraphs(totalContent);

    // 渲染关键词
    updateKeywords(data.keywords);
}

// 按照内容长度分段更新
function updateParagraphs(content) {
    const totalLength = content.length;
    const partLength = Math.ceil(totalLength / 8);  // 每段的目标字符长度

    for (let i = 0; i < 8; i++) {
        const start = i * partLength;
        const end = (i + 1) * partLength;
        const paragraphText = content.substring(start, end);
        $(`#paragraph${i + 1}`).text(paragraphText);
    }
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
        url: 'http://localhost:8080/article/categories_with_count',
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
            alert('无法获取分类数据，请稍后再试。');
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
        url: `http://localhost:8080/article/update_click/${article_id}`,
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
        url: `http://localhost:8080/article/get_prev_next/${aid}`,
        type: 'GET',
        timeout: 5000,
        success: function (data) {
            try {
                // 检查并解析上一篇文章
                if (data.prev) {
                    // 解析 JSON 字符串为对象
                    var prev = data.prev;
                    $('#pre_title').text(prev.title);
                    $('#pre_img')
                        .attr('src', prev.image_url || '默认图片路径')
                        .addClass('article-image'); // 添加 CSS 类
                    $('#pre_btn').attr('href', `blog-detail-1.html?aid=${prev.aid}`);
                    console.log('上一篇文章:', prev);
                } else {
                    $('#pre_title').text('没有上一篇文章');
                    $('#pre_img')
                        .attr('src', '默认图片路径')
                        .addClass('article-image'); // 添加 CSS 类
                    $('#pre_btn').attr('href', '#');
                }

                // 检查并解析下一篇文章
                if (data.next) {
                    // 解析 JSON 字符串为对象
                    var next = data.next;
                    $('#next_title').text(next.title);
                    $('#next_img')
                        .attr('src', next.image_url || '默认图片路径')
                        .addClass('article-image'); // 添加 CSS 类
                    $('#next_btn').attr('href', `blog-detail-1.html?aid=${next.aid}`);
                    console.log('下一篇文章:', next);
                } else {
                    $('#next_title').text('没有下一篇文章');
                    $('#next_img')
                        .attr('src', '默认图片路径')
                        .addClass('article-image'); // 添加 CSS 类
                    $('#next_btn').attr('href', '#');
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
        url: 'http://localhost:8080/article/get_recent_articles',
        type: 'GET',
        success: function (data) {
            // 检查数据是否成功返回
            if (data.success && Array.isArray(data.data)) {
                var recent_articles = data.data;
                console.log('最近发布的文章:', recent_articles);
                for (var i = 0; i < recent_articles.length; i++) {
                    var article = recent_articles[i];
                    
                    // 设置文章链接
                    $('#recently_article' + (i + 1)).attr('href', 'blog-detail-1.html?aid=' + article.aid);
                    
                    // 设置图片 src 并添加样式
                    $('#recently_img' + (i + 1)).attr('src', article.image_url).css({
                        'width': '120px',
                        'height': '94px',
                        'object-fit': 'cover', 
                        'display': 'block' // 确保图片以块级元素显示，防止布局问题
                    });
                    // 时间处理：Fri, 27 Sep 2024 16:23:10 GMT 转换为 2024年9月27日
                    var date = timestampToTime(article.update_time);
                    // 设置更新时间和分类 ID
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




