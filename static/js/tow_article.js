$(document).ready(function () {
    const urlParams = new URLSearchParams(window.location.search);
    const cid = urlParams.get('cid');
    if (cid) {
        getArticlesByCategory(cid);
    } else {
        console.error('URL中未找到文章分类ID');
    }
}
);
// 修改标题为分类名
function updateCategoryName(categoryName) {
    $('#title').text(categoryName);
}

// 获取分类下所有文章
function getArticlesByCategory(cid) {
    var loadingIndicator = $('#loading'); // 如果有加载指示器
    var articlesContainer = $('#articles-container');
    // loadingIndicator.show(); // 如果有加载指示器
    // articlesContainer.hide(); // 如果有加载指示器

    $.ajax({
        url: `${API_BASE_URL}/article/get_category_articles/${cid}`,
        type: 'GET',
        success: function (data) {
            // loadingIndicator.hide(); // 如果有加载指示器
            // articlesContainer.show(); // 如果有加载指示器

            if (Array.isArray(data)) {
                articlesContainer.empty(); // 清空现有内容
                updateCategoryName(data[0].category_name);
                console.log('分类名:', data[0].category_name);
                data.forEach(function (article) {
                    var articleHtml = `
                        <div class="article-item">
                            <a href="blog-detail-1.html?aid=${article.aid}">
                                <img class="article-image" src="${article.image_url}" alt="${article.title}">
                            </a>
                            <div class="article-content">
                                <a href="blog-detail-1.html?aid=${article.aid}" class="article-title">${article.title}</a>
                                <div class="article-meta">
                                    <strong>作者：${article.author || '未知'}</strong>
                                    <strong>发布时间：${article.update_time}</strong>
                                </div>
                                <div class="article-click">
                                    <img src="static/picture/eye.png" alt="点击量">
                                    <p class="medium-gray">${article.click || 0}</p>
                                </div>
                                <a href="blog-detail-1.html?aid=${article.aid}" class="read-more-btn">Read More</a>
                            </div>
                        </div>
                    `;
                    articlesContainer.append(articleHtml);
                });
            } else {
                console.error('获取的文章数据格式不正确:', data);
                articlesContainer.html('<p class="error">无法加载文章，请稍后再试。</p>');
            }
        },
        error: function (error) {
            console.log('Error fetching articles:', error);
            articlesContainer.html('<p class="error">无法加载文章，请稍后再试。</p>');
            // loadingIndicator.hide(); // 如果有加载指示器
            // articlesContainer.show(); // 如果有加载指示器
        }
    });
}


function replaceLocalhostWithIp(url) {
    return new Promise(function (resolve, reject) {
        $.ajax({
            url: API_BASE_URL + `/article/get_local_ip`,
            type: 'GET',
            success: function (data) {
                console.log('本地IP:', data.local_ip);
                // 替换 URL 中的 localhost
                const updatedUrl = url.replace('http://localhost:8080', `http://${data.local_ip}:8080`);
                resolve(updatedUrl);
            },
            error: function (error) {
                console.error('获取本地IP失败:', error);
                resolve(url); // 获取 IP 失败时返回原始 URL
            }
        });
    });
}


