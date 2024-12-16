// 当页面加载完成后执行
$(document).ready(function () {
    // 发起请求获取分类和文章数量数据
    getCategoryCount();
    getHotArticles();
});
// 获取分类和文章数量
function getCategoryCount() {
    $.ajax({
        url: `${API_BASE_URL}/article/categories_with_count`,
        type: 'GET',
        success: function (data) {
            // 遍历数据，将文章数量和分类名更新到页面上
            for (var i = 0; i < data.length; i++) {
                var category = data[i];
                $('#category_name' + category.cid).text(category.category_name);
                $('#category-' + category.cid).text(category.article_count);
                // 设置分类链接
                $('#category_link' + (i + 1)).attr('href', 'blog-grid-1.html?cid=' + category.cid);
            }
        },
        error: function (error) {
            console.log('Error fetching categories:', error);
        }
    });
}
// 获取热门文章
function getHotArticles() {
    $.ajax({
        url: `${API_BASE_URL}/article/get_hot_articles`,
        type: 'GET',
        success: function (data) {
            // 遍历数据，将文章数量和分类名更新到页面上
            // 查询到五条热门文章，遍历数据，将文章标题和时间作者更新到页面上
            console.log(data);
            for (let i = 0; i < data.length; i++) {
                var article = data[i];
                $('#hot-title' + (i + 1)).text(article.title);
                // 时间戳转某年某月某日某分
                var date = new Date(article.addtime);
                var year = date.getFullYear();
                var month = date.getMonth() + 1;
                var day = date.getDate();
                var hour = date.getHours();
                var minute = date.getMinutes();
                $('#data-auth' + (i + 1)).text(year + '年' + month + '月' + day + '日' + hour + '时' + minute + '分' + ' • 作者：' + article.author);
                // 设置img src路径
                // $('#hot-img' + (i + 1)).attr('src', article.image_url);
                replaceLocalhostWithIp(article.image_url, function (updatedUrl) {
                    $('#hot-img' + (i + 1)).attr('src', updatedUrl);
                });
                // 设置文章链接
                $('#article_url' + (i + 1)).attr('href', 'blog-detail-1.html?aid=' + article.aid);
            }
        },
        error: function (error) {
            console.log('Error fetching hot articles:', error);
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






