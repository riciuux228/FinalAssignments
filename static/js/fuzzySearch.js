function initSearch() {
    const apiUrl = `${API_BASE_URL}/article/fuzzy_search/`;
    const resultsContainerId = 'search-results-container';
    const prevPageBtnId = 'prev-page';
    const nextPageBtnId = 'next-page';
    const pageInfoId = 'page-info';
    $(document).ready(function () {
        const urlParams = new URLSearchParams(window.location.search);
        const keyword = urlParams.get('keyword');

        if (!keyword) {
            return; // 如果没有关键词，直接返回
        }

        var searchResults = [];
        const resultsPerPage = 6;
        let currentPage = 1;

        // 跳转到搜索结果页面
        $.ajax({
            url: apiUrl + keyword,
            type: 'GET',
            success: function (data) {
                console.log('搜索结果:', data);
                searchResults = data;
                // 初始显示第一页的结果
                displayResults(currentPage);
            },
            error: function (error) {
                console.error('获取搜索结果时发生错误:', error);
            }
        });

        // 时间戳转换函数
        function timestampToTime(timestamp) {
            const date = new Date(timestamp);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            return `${year}年${month}月${day}日`;
        }

        function displayResults(page) {
            const start = (page - 1) * resultsPerPage;
            const end = start + resultsPerPage;
            const resultsToDisplay = searchResults.slice(start, end);

            const container = $(`#${resultsContainerId}`);
            container.empty();
            const base_url = "blog-detail-1.html?aid=";
            resultsToDisplay.forEach(result => {
                const resultCard = `
                    <div class="col-md-4">
                        <div class="card mb-4 shadow-sm">
                            <img src="${result.image_url}" class="card-img-top" alt="文章图片">
                            <div class="card-body">
                                <h5 class="card-title">${result.title}</h5>
                                <p class="card-text">${result.description}</p>
                                <p class="card-text"><small class="text-muted">更新时间：${timestampToTime(result.update_time)}</small></p>
                                <p class="card-text"><small class="text-muted">作者：${result.author}</small></p>
                                <a href="${base_url + result.aid}" class="btn btn-primary">阅读更多</a>
                            </div>
                        </div>
                    </div>
                `;
                container.append(resultCard);
            });

            const totalPages = Math.ceil(searchResults.length / resultsPerPage);
            $(`#${pageInfoId}`).text(`第 ${currentPage} 页，共 ${totalPages} 页`);
            $(`#${prevPageBtnId}`).prop('disabled', currentPage === 1);
            $(`#${nextPageBtnId}`).prop('disabled', currentPage === totalPages);
        }

        $(`#${prevPageBtnId}`).on('click', function () {
            if (currentPage > 1) {
                currentPage--;
                displayResults(currentPage);
            }
        });

        $(`#${nextPageBtnId}`).on('click', function () {
            if (currentPage < Math.ceil(searchResults.length / resultsPerPage)) {
                currentPage++;
                displayResults(currentPage);
            }
        });
    });
}

// 表单提交
$(document).ready(function () {
    $('#demo-2').submit(function (e) {
        e.preventDefault();
        const keyword = $('#demo-2 input').val();
        window.location.href = `search.html?keyword=${keyword}`;
    });
});

// 在页面加载时调用 initSearch
$(document).ready(function () {
    initSearch();
});