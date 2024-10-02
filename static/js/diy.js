function getTime() {
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1; // 加1使月份正确显示
    var day = date.getDate();
    var hour = date.getHours();
    var minute = date.getMinutes();
    var second = date.getSeconds();
    var time = year + "年" + month + "月" + day + "日 " + hour + "时" + minute + "分" + second + "秒";
    return time;
}

function showTime() {
    var str = getTime();
    $("#time").html(str); // 使用 jQuery 设置 HTML 内容
}

// 使用 window.onload 触发 showTime 函数
window.onload = function() {
    setInterval(showTime, 1000); // 每秒更新一次时间
};