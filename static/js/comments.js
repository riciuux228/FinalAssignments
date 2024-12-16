$(document).ready(function () {
    // 获取urlz中的aid

    var aid = window.location.search.substr(1).split('=')[1];
    console.log("aid:", aid);

    getComments(aid);
    // 绑定提交新评论按钮的点击事件
    $('#new-comment-submit').on('click', function () {
        submitNewComment();
    });
});


// 提交新评论（一级评论）
function submitNewComment() {
    let aid = window.location.search.substr(1).split('=')[1];
    let commentContent = $('#new-comment-textarea').val().trim();

    if (commentContent === '') {
        alert('评论内容不能为空！');
        return;
    }

    // 从 token 中获取用户信息
    var user = JSON.parse(localStorage.getItem('user'));  // 先取出并解析存储的 'user' 对象
    if (user && user.token) {
        var token = user.token;  // 从 'user' 对象中提取 token
        console.log("token:", token);
        console.log("user:", user);
        $.ajax({
            type: "POST",
            url: API_BASE_URL + "/comments/add",
            data: {
                article_id: aid,
                user_id: user.user_id,
                content: commentContent,
            },
            success: function (data) {
                console.log(data);
                // 渲染评论
                getComments(aid);
            },
            error: function () {
                console.log("提交评论失败");
            }
        });
        // 清空评论框
        $('#new-comment-textarea').val('');
    } else {
        console.log("未找到 token，请先登录");
        // 可以根据情况重定向到登录页面
        window.location.href = "/login.html";
    }
}



// 全局变量，用于存储评论映射
let commentMap = {};
let commentTree = [];

// 获取评论数据
function getComments(aid) {
    updateCommentCount(aid);
    // 记录当前展开的评论 ID
    let expandedComments = [];
    $(".replies:visible").each(function () {
        expandedComments.push($(this).parent().attr('id'));
    });

    $.ajax({
        type: "GET",
        url: API_BASE_URL + "/comments/" + aid,
        success: function (data) {
            // 渲染评论
            console.log(data);
            renderComments(data);

            // 重新展开之前展开的评论
            expandedComments.forEach(function (commentId) {
                toggleReplies(commentId, true);
            });
        },
        error: function () {
            console.log("获取评论失败");
        }
    });
}

// 渲染评论
function renderComments(data) {
    // 清空评论列表并开始渲染
    $("#comment-list").empty();

    // 如果没有传入数据，使用全局的 commentMap
    if (!data) {
        data = Object.values(commentMap);
    }

    // 构建评论映射和评论树
    commentMap = {};
    commentTree = [];

    // 构建评论映射
    data.forEach(comment => {
        comment.children = comment.children || [];
        commentMap[comment.id] = comment;
    });

    // 构建评论树
    data.forEach(comment => {
        if (comment.parent_comment_id == null) {
            // 一级评论
            commentTree.push(comment);
        } else {
            // 多级评论
            let parentComment = commentMap[comment.parent_comment_id];
            if (parentComment) {
                parentComment.children.push(comment);
            } else {
                // 父评论不存在，作为一级评论处理
                commentTree.push(comment);
            }
        }
    });

    // 渲染评论树
    renderCommentTree(commentTree, $("#comment-list"));
}

function renderCommentTree(comments, container, level = 1) {
    comments.forEach(function (comment) {
        let commentElement = renderCommentElement(comment, level);
        container.append(commentElement);

        if (comment.children && comment.children.length > 0 && level < 2) {
            // 创建子评论容器
            let repliesContainer = $("<div class='replies' style='display:none;'></div>");
            commentElement.append(repliesContainer);

            // 递归渲染第二层子评论
            renderCommentTree(comment.children, repliesContainer, level + 1);

            // 添加展开/收起回复按钮
            let replyToggle = commentElement.find("#reply");
            replyToggle.attr('onclick', 'toggleReplies(' + comment.id + ')');
            replyToggle.text('展开');
            replyToggle.show();
        } else if (comment.children && comment.children.length > 0 && level >= 2) {
            // 对于二级以上的评论，展开其所有子评论并平铺显示
            let flatComments = flattenComments(comment.children);
            flatComments.forEach(function (childComment) {
                let childCommentElement = renderCommentElement(childComment, level + 1);
                container.append(childCommentElement);
            });
        } else {
            // 没有子评论或已经达到第二层，隐藏展开回复按钮
            commentElement.find("#reply").hide();
        }
    });
}

// 渲染单个评论元素，增加层级作为参数
function renderCommentElement(comment, level) {
    // 根据评论的层级，选择对应的 class
    let commentClass = level === 1 ? 'first_comment' : 'second_comment';

    let commentDiv = $("<div class='" + commentClass + "' id='" + comment.id + "'></div>");
    let comment_head = $("<div id='comment_head'></div>");
    let comment_body = $("<div id='comment_body'></div>");
    let comment_footer = $("<div id='comment_footer'></div>");
    let user_icon_url = $("<img src='" + comment.user_icon_url + "' alt='' id='user_icon_url'>");
    let username = $("<span id='username'>" + comment.username + "</span>");
    let role = $("<span id='role'>用户</span>");  // 初始化为用户
    console.log("评论用户id:", comment.user_id);

    // 将 role 追加到 comment_head 中
    comment_head.append(user_icon_url, username, role);

    // 异步获取作者ID并比对
    getAuthorId(window.location.search.substr(1).split('=')[1], function (authorId) {
        if (comment.user_id == authorId) {
            // 修改页面中已有的 role 元素，而不是创建新的 role
            role.text('作者');  // 更新文本为"作者"
            role.css("color", "red");  // 改变颜色为红色
            console.log("比对成功，更新为作者");
        } else {
            console.log("比对失败，仍为用户");
        }
    });

    let time = $("<span id='time'>" + timestampToTime(comment.created_at) + "</span>");
    let replyToggle = $("<span id='reply'>展开</span>");
    let like = $("<span id='like'>👍</span>");
    let dislike = $("<span id='dislike'>👎</span>");
    let replyButton = $("<span id='reply_button'>回复</span>");
    let likeCount = $("<span id='like_count'>" + comment.like_count + "</span>"); // 显示点赞数量

    // 如果是回复，添加“回复某人”
    let replyText = "";
    if (comment.parent_comment_id != null && level > 1) {
        let parentUsername = getUserName(comment.parent_comment_id);
        replyText = "回复 <strong>" + parentUsername + "</strong>：";
    }
    let content = $("<span id='content'>" + replyText + comment.content + "</span>");

    comment_body.append(content);
    comment_footer.append(time, replyToggle, replyButton, like, likeCount, dislike); // 将点赞数量放在点赞图标旁边
    commentDiv.append(comment_head, comment_body, comment_footer);

    // 绑定点击事件，显示回复输入框
    replyButton.on('click', function () {
        showReplyInput(comment.id);
    });

    // 绑定点赞事件
    like.on('click', function () {
        likeComment(comment.id, likeCount);
    });

    // 绑定点踩事件
    dislike.on('click', function () {
        dislikeComment(comment.id, likeCount);
    });

    return commentDiv;
}


// 点踩评论
function dislikeComment(commentId, likeCountElement) {
    console.log("dislike comment: ", commentId);
    $.ajax({
        type: "POST",
        url: API_BASE_URL + "/comments/add_dislike",
        data: {
            comment_id: commentId
        },
        success: function (data) {
            console.log(data);
            // 更新点踩数量
            likeCountElement.text(data.like_count);
        },
        error: function () {
            console.log("点踩失败");
        }
    });
}

// 点赞评论
function likeComment(commentId, likeCountElement) {
    console.log("like comment: ", commentId);
    $.ajax({
        type: "POST",
        url: API_BASE_URL + "/comments/add_like",
        data: {
            comment_id: commentId
        },
        success: function (data) {
            console.log(data);
            // 更新点赞数量
            likeCountElement.text(data.like_count);
        },
        error: function () {
            console.log("点赞失败");
        }
    });
}
// 显示回复输入框
function showReplyInput(commentId) {
    // 在显示新的回复框之前，先移除已有的回复框
    $('.reply_input').remove();

    let replyInputDiv = $(`
        <div id='reply_input_${commentId}' class='reply_input'>
            <textarea id='reply_textarea_${commentId}' class='reply_textarea' placeholder='输入你的回复...'></textarea>
            <div class='reply_buttons'>
                <button id='reply_submit_${commentId}' class='reply_submit' onclick='submitReply(${commentId})'>提交</button>
                <button id='reply_cancel_${commentId}' class='reply_cancel' onclick='cancelReply(${commentId})'>取消</button>
            </div>
        </div>
    `);

    // 将输入框插入到对应评论的后面
    $('#' + commentId).append(replyInputDiv);

    // 自动聚焦到文本域
    $('#reply_textarea_' + commentId).focus();
}


// 提交回复
function submitReply(parent_comment_id) {
    let aid = window.location.search.substr(1).split('=')[1];
    let replyContent = $('#reply_textarea_' + parent_comment_id).val().trim();

    if (replyContent === '') {
        alert('回复内容不能为空！');
        return;
    }
    // 从 token 中获取用户信息
    var user = JSON.parse(localStorage.getItem('user'));  // 先取出并解析存储的 'user' 对象
    if (user && user.token) {
        var token = user.token;  // 从 'user' 对象中提取 token
        console.log("token:", token);
        console.log("user:", user);
        $.ajax({
            type: "POST",
            url: API_BASE_URL + "/comments/add",
            data: {
                article_id: aid,
                user_id: user.user_id,
                parent_comment_id: parent_comment_id,
                content: replyContent,
            },
            success: function (data) {
                console.log(data);
                // 渲染评论
                getComments(aid);
            },
            error: function () {
                console.log("提交回复失败");
            }
        });
    } else {
        console.log("未找到 token，请先登录");
        // 可以根据情况重定向到登录页面
        window.location.href = "/login.html";
    }
}

// 取消回复
function cancelReply(commentId) {
    $('#reply_input_' + commentId).remove();
}

// 点击展开/收起回复，递归处理所有子评论
function toggleReplies(commentId, forceExpand = false) {
    const commentElement = $("#" + commentId);
    const repliesContainer = commentElement.children('.replies');
    const replyToggle = commentElement.find("#reply");

    if (repliesContainer.is(':visible') && !forceExpand) {
        repliesContainer.hide();
        replyToggle.text('展开');
        $('.reply_input').remove();
    } else {
        repliesContainer.show();
        replyToggle.text('收起');
        $('.reply_input').remove();
    }
}

// 查找父评论的用户名
function getUserName(parentCommentId) {
    const comment = commentMap[parentCommentId];
    return comment ? comment.username : "用户";
}

// 时间戳转换函数
function timestampToTime(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}年${month}月${day}日`;
}

// 展开子评论为平铺列表
function flattenComments(comments) {
    let flatList = [];
    comments.forEach(comment => {
        flatList.push(comment);
        if (comment.children && comment.children.length > 0) {
            flatList = flatList.concat(flattenComments(comment.children));
        }
    });
    return flatList;
}

// 更新评论数量
function updateCommentCount(aid) {
    $.ajax({
        type: "GET",
        url: API_BASE_URL + "/comments/count/" + aid,
        success: function (data) {
            console.log(data);
            $('#comment_counts').text(`${data.count} 条评论`);

            if (data.count === 0) {
                $('#comment_counts').text('暂无评论');
            }
        },
        error: function () {
            console.log("获取评论数量失败");
        }
    });
}


// 获取文章的作者id
function getAuthorId(article_id, callback) {
    $.ajax({
        type: "GET",
        url: API_BASE_URL + "/article/get_author_id/" + article_id,
        success: function (data) {
            console.log("获取作者id成功:", data.auth_id);
            callback(data.auth_id);
        },
        error: function () {
            console.log("获取作者id失败");
        }
    });
}
