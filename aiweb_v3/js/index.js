var user_uid, user_email;
var userrndstr, conversationid;
var contextarray = [];
var isstarted = true;
var isalltext = false;
var answer;
var buttongo = true;
var retrytimes = 0;
var userScrolling = false;
var scrollnow = 0;
var previousScrollPosition = 0;
var layerqrcode = 0;
var loading = 0;
var currentTime;
var freezegogogo = false;
var layerconfirm = 0;
var refreshhistorytime = 0;
var nextrefreshhistorytime = 1;
var check_chat_exist = false;

var defaults = {
    html: false,        // Enable HTML tags in source
    xhtmlOut: false,        // Use '/' to close single tags (<br />)
    breaks: false,        // Convert '\n' in paragraphs into <br>
    langPrefix: 'language-',  // CSS language prefix for fenced blocks
    linkify: true,         // autoconvert URL-like texts to links
    linkTarget: '',           // set target to open link in
    typographer: true,         // Enable smartypants and other sweet transforms
    _highlight: true,
    _strict: false,
    _view: 'html'
};

defaults.highlight = function (str, lang) {
    if (!defaults._highlight || !window.hljs) { return ''; }

    var hljs = window.hljs;
    if (lang && hljs.getLanguage(lang)) {
        try {
            return hljs.highlight(lang, str).value;
        } catch (__) { }
    }

    try {
        return hljs.highlightAuto(str).value;
    } catch (__) { }

    return '';
};

mdHtml = new window.Remarkable('full', defaults);

$(document).on('click', '.product', function () {
    $(this).addClass("selected").siblings().removeClass("selected");
    $("#productid").val($(this).attr("productid"));
});

$(document).ready(function () {
    $(document).click(function (event) {
        var layer = $(".home_prompt-hints");
        var layer2 = $("#scene_button");
        var target = event.target;

        // 判断被点击的元素是否是图层本身或者图层内部的元素
        if (target === layer[0] || target === layer2[0] || layer.has(target).length || layer2.has(target).length) {
            return;
        }
        $(".home_prompt-hints").hide();
    });

    $('#question').click(function () {
        checkloginstatus();
    });
    $('.home_sidebar-body').scroll(function () {
        var element = $(this);
        if (element.scrollTop() + element.innerHeight() + 10 >= element[0].scrollHeight) {
            // 滚动条已经滚动到最下方
            if (refreshhistorytime < nextrefreshhistorytime) {
                refreshhistorytime++;
                refreshhistory(refreshhistorytime);
            }
        }
    });

});


// 初始化
$(function () {

    if ($.cookie("fullscreen")) {
        $('.home_container:first').toggleClass('home_tight-container');
        $('.max_min i').toggleClass('layui-icon-screen-restore');
    }

    //ctrl+enter键
    $("#question").keydown(function (e) {
        if (e.ctrlKey && e.which == 13) {
            gogogo($('#question').val()); return false;
        }
    });

    // 监听输入框
    $('#question').bind('input propertychange', 'textarea', function () {
        var input = $('#question').val();

        // 打开预设场景
        if (input == '/') {
            $('.home_prompt-hints').show();
        } else {
            $('.home_prompt-hints').hide();
        }

        // 输入中元素是否存在
        if ($('.home_chat-message-status').length > 0) {
            if (input == undefined || input == null || input == '' || input == ' ') {
                $('.home_chat-message-user:last').remove();
                return false;
            }
            $(".home_chat-message-user:last code").text(input);
        } else {
            user_output(input, true);
            chat_roll();
        }
    });

    $.removeCookie('check_id');

    if ($.cookie('userrndstr')) {
        userrndstr = decryptCookie($.cookie('userrndstr'), 'ChatGPT');
        checkuserstatus();
    } else {
        userrndstr = randomString(8) + websiterndstr;
    }

    // 模型、角色下拉框
    var mode_js = $.parseJSON($('#mode_js').val());
    var role_js = $.parseJSON($('#role_js').val());

    layui.use('dropdown', function () {
        var dropdown = layui.dropdown, $ = layui.jquery;
        dropdown.render({
            elem: '.mode_js',
            style: 'background-color: var(--white);',
            className: 'dropdown-background',
            data: mode_js,
            click: function (data, othis) {
                $('#model').val(data.modelid);
                $('#modelvalue').val(data.modelvalue);
                $(this.elem).children('span').text(data.title);
                $.cookie('model', data.modelid);
                $.cookie('modelvalue', data.modelvalue);
                $.cookie('modelname', data.title);
            }
        });
    });

    layui.use('dropdown', function () {
        var dropdown = layui.dropdown, $ = layui.jquery;
        dropdown.render({
            elem: '.role_js',
            style: 'background-color: var(--white);',
            className: 'dropdown-background',
            data: role_js,
            click: function (data, othis) {
                $('#role').val(data.rolevalue);
                $(this.elem).children('span').text(data.title);
                $.cookie('role', data.rolevalue);
                $.cookie('rolename', data.title);
            }
        });
    });

    var clipboard = new ClipboardJS(".copy_msg,.copy_code,.copy_p", {
        text: function (trigger) {
            if ($(trigger).prop('nodeName') == 'DIV') {
                return $(trigger).parent().next().text();
            } else if ($(trigger).prop('nodeName') == 'P') {
                return $(trigger).text();
            } else {
                return $(trigger).parent().text();
            }
        },
    });
    clipboard.on('success', function (e) {
        layer.msg('复制成功', { skin: 'custom_alert1' });

    });
    clipboard.on('error', function (e) {
        layer.msg('复制失败！', { skin: 'custom_alert1' });
    });

    // 全局样式切换
    $("#all_style").new_toggle(
        function () {
            $("body").addClass("light");
            $("#all_style i").html('&#xe748;');
        },
        function () {
            $("body").addClass("dark");
            $("#all_style i").html('&#xe6c2;');
        },
        function () {
            $("body").removeClass();
            $("#all_style i").html('&#xe68d;');
        }
    );
});

// 兼容toggle
$.fn.new_toggle = function (fn, fn2) {
    var args = arguments, guid = fn.guid || $.guid++, i = 0,
        toggle = function (event) {
            var lastToggle = ($._data(this, "lastToggle" + fn.guid) || 0) % i;
            $._data(this, "lastToggle" + fn.guid, lastToggle + 1);
            event.preventDefault();
            return args[lastToggle].apply(this, arguments) || false;
        };
    toggle.guid = guid;
    while (i < args.length) {
        args[i++].guid = guid;
    }
    return this.click(toggle);
};

function checkloginstatus() {
    if (!user_uid) {
        $('.home_sidebar').toggleClass('home_sidebar-show');
        showqrcode();
    }
}

// 新建会话
function create_chat() {
    if ($(".home_chat-item-title:first").text() == "新的聊天") {
        $(".home_chat-item:first").click();
    } else if (user_uid) {
        contextarray = [];
        conversationid = Date.now();
        chat_prepend(conversationid, '新的聊天');

        $.cookie('check_id', conversationid);
        showconversation(conversationid);
    }
}

// 重试消息
function retry_msg(obj) {
    var prev_msg = $(obj).parents().filter(".home_chat-message").prev().find("code").text();
    $('#question').val(prev_msg);
    user_output(prev_msg, true);
    gogogo(prev_msg);
}

function show_mathjax(obj) {
    MathJax.Hub.Config({
        showProcessingMessages: false,
        messageStyle: "none",
        extensions: ["tex2jax.js"],
        jax: ["input/TeX", "output/HTML-CSS"],
        tex2jax: {
            inlineMath: [["$", "$"]],
            displayMath: [["$$", "$$"]],
            skipTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code', 'a'],
            ignoreClass: "comment-content"
        },
        "HTML-CSS": {
            availableFonts: ["STIX", "TeX"],
            showMathMenu: false
        },
        showProcessingMessages: false,    //隐藏加载时候左下角加载情况的展示
        messageStyle: "none"              //隐藏加载时候左下角加载情况的展示
    });
    MathJax.Hub.Queue(["Typeset", MathJax.Hub], obj);
}

function user_output(msg, input = false) {
    var input_h = (input) ? '<div class="home_chat-message-status">正在输入…</div>' : '';
    var html = '<div class="home_chat-message-user">' +
        '<div class="home_chat-message-container">' + input_h +
        '<div class="home_chat-message-item">' +
        '<div class="markdown-body">' +
        '<div class="home_chat-message-top-actions" style="left:0;">' +
        '<div class="home_chat-message-top-action copy_msg" data-clipboard-action="copy">复制</div>' +
        '</div>' +
        '<code style="background:transparent;font-size:100%;padding:0;"></code>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>';
    $('.home_chat-body').append(html);
    $(".home_chat-message-user:last code").text(msg);
}

function ai_output(id, time, model, msg = '') {
    var html = '<div class="home_chat-message">' +
        '<div class="home_chat-message-container">' +
        '<div class="home_chat-message-item">' +
        '<div class="home_chat-message-top-actions">' +
        '<div class="home_chat-message-top-action" onclick="retry_msg(this)">重试</div>' +
        '<div class="home_chat-message-top-action copy_msg" data-clipboard-action="copy">复制</div>' +
        '</div>' +
        '<div class="markdown-body" id="' + id + '">' + msg + '</div>' +
        '</div>' +
        '<div class="home_chat-message-actions">' +
        '<div class="home_chat-message-action-date">' + time + '</div>' +
        '<div class="home_chat-message-action-date" style="margin-right:10px;">' + model + '模型</div>' +
        '</div>' +
        '</div>' +
        '</div>'
    $('.home_chat-body').append(html);
}

function chat_prepend(id, name, num = 0, time = getMyDate()) {
    var html = '<div id=' + id + ' class="home_chat-item home_chat-item-selected" onclick="showconversation(' + id + ');">' +
        '<div class="home_chat-item-title">' + name + '</div>' +
        '<div class="home_chat-item-info">' +
        '<div class="home_chat-item-count">' + num + ' 条对话</div>' +
        '<div class="home_chat-item-date">' + time + '</div>' +
        '</div>' +
        '<i onclick="deleteconversation(' + id + ')" class="layui-icon home_chat-item-delete">&#xe693;</i>' +
        '</div>';

    $('.home_sidebar-body').children().removeClass("home_chat-item-selected");
    $('.home_sidebar-body').prepend(html);
}

function chat_append(id, name, num = 0, time = getMyDate()) {
    var html = '<div id=' + id + ' class="home_chat-item home_chat-item-selected" onclick="showconversation(' + id + ');">' +
        '<div class="home_chat-item-title">' + name + '</div>' +
        '<div class="home_chat-item-info">' +
        '<div class="home_chat-item-count">' + num + ' 条对话</div>' +
        '<div class="home_chat-item-date">' + time + '</div>' +
        '</div>' +
        '<i onclick="deleteconversation(' + id + ')" class="layui-icon home_chat-item-delete">&#xe693;</i>' +
        '</div>';

    $('.home_sidebar-body').children().removeClass("home_chat-item-selected");
    $('.home_sidebar-body').append(html);
}

// 会话页面滚动到底部
function chat_roll(type = 'low') {
    var low = $('.home_chat-body').prop("scrollHeight");
    $('.home_chat-body').scrollTop(low);
}

// 获取当前时间
function getMyDate(time = false) {
    if (time == true) return Date.now() + String(new Date().getMilliseconds());
    let now = new Date,
        y = now.getFullYear(),
        m = now.getMonth() + 1,
        d = now.getDate();
    return y + "-" + (m < 10 ? "0" + m : m) + "-" + (d < 10 ? "0" + d : d) + " " + now.toTimeString().substr(0, 8);
}

// 记录消息
function messageLog() {
    // 更新页面数量
    var msg_num = Number($('#chat_msg_count').text()) + 1;
    $('#' + $.cookie('check_id') + ' .home_chat-item-count').text(msg_num + '条消息');
    $('#chat_msg_count').text(msg_num);
}

// 打开登录框
function showqrcode() {
    if (iswindowloginonly) {
        showuserlogin();
        layerqrcode = layer.open({
            type: 1,
            title: false,
            closeBtn: false,
            area: ['300px', '350px'],
            content: $('#mydialog'),
            shadeClose: true,
        });
        checkuserstatus();
    } else if (isthirdpartyloginonly) {
        window.open(thirdpartyloginurl, '_blank');
    } else {
        var isWechat = /MicroMessenger/i.test(navigator.userAgent);
        if (isWechat) {
            $.cookie('userrndstr', encryptCookie(userrndstr, 'ChatGPT'), {
                expires: 30,
                path: '/'
            });
            layer.msg("登录中，请稍候……", {
                icon: 16,
                shade: 0.4,
                time: false //取消自动关闭
            });
            location.href = window.location.protocol + "//" + window.location.hostname + "/s.php?m=1&s=" + userrndstr;
        } else {

            $("#mycontent").html("");
            $("#mycontent").qrcode(window.location.protocol + "//" + window.location.hostname + "/s.php?s=" + userrndstr);
            checkuserstatus();
            $("#mytitle").html(logintitleleft);
            layerqrcode = layer.open({
                type: 1,
                title: false,
                closeBtn: false,
                area: ['300px', '350px'],
                offset: ['calc(50% - 175px)', 'calc(50% - 150px)'],
                content: $('#mydialog'),
                shadeClose: true,
            });

        }
    }
}

// 微信扫码登录
function showwxlogin() {
    $("#mytitle").html(logintitleleft);
    $("#mycontent").html("");
    $("#mycontent").qrcode(window.location.protocol + "//" + window.location.hostname + "/s.php?s=" + userrndstr);
}

// 邮箱密码登录
function showuserlogin() {
    $("#mytitle").html(logintitleright);
    $("#mycontent").html("<iframe style='width:100%;height:100%;' src='userlogin.php?userrndstr=" + userrndstr + "' scrolling='no'></iframe>");
}

// 检查登录状态
function checkuserstatus() {
    $.ajax({
        url: "checkuserstatus.php?rid=" + randomString(10) + "&userrndstr=" + userrndstr,
        dataType: "json",
        success: function (data) {
            if (data.success) {
                user_uid = data.uid;
                user_email = data.email;
                $(".home_sidebar-header-bar").html('<button onclick="showuserinfo()" class="button_icon-button button_shadow home_sidebar-bar-button clickable"><div class="button_icon-button-icon"><i class="layui-icon">&#xe66f;</i></div><div class="button_icon-button-text">个人信息</div></button>');
                $(".home_sidebar-header-bar").append('<button onclick="buy()" class="button_icon-button button_shadow home_sidebar-bar-button clickable"><div class="button_icon-button-icon"><i class="layui-icon">&#xe65e;</i></div><div class="button_icon-button-text">充值</div></button>');
                $(".home_sidebar-header-bar").append('<button onclick="logout()" class="button_icon-button button_shadow home_sidebar-bar-button clickable"><div class="button_icon-button-icon"><i class="layui-icon">&#xe682;</i></div><div class="button_icon-button-text">退出</div></button>');
                if (typeof layerqrcode !== "undefined") layer.close(layerqrcode);
                if (data.email == "") setTimeout("showuserinfo();", 500);

                // 设置cookie
                $.cookie('userrndstr', encryptCookie(userrndstr, 'ChatGPT'), {
                    expires: 30,
                    path: '/'
                });
                refreshquota();
                refreshhistory();
                // $("#userpanel").css("display", "show");
                $("#userpanel").show();
                $("#question").removeAttr("disabled");
                $("#question").val("");
                $("#divsharechat").show();
            } else {
                if ($.cookie('userrndstr')) {
                    $.removeCookie('userrndstr');
                    layer.alert('您已在其他地方扫码登录过，本地保存的登录信息已失效。', {
                        icon: 2,
                        btn: ['确定'],
                        closeBtn: 0,
                        yes: function () {
                            location.reload();
                        }
                    });
                } else {
                    setTimeout(checkuserstatus, 1000);
                }
            }
        },
        error: function (xhr, status, error) {
            setTimeout(checkuserstatus, 1000);
        }
    });
}

// 退出
function logout() {
    $.removeCookie('userrndstr');
    $.removeCookie('check_id');
    location.reload();
}

// 获取随机字符串
function randomString(len) {
    len = len || 32;
    var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'; /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
    var maxPos = $chars.length;
    var pwd = '';
    for (i = 0; i < len; i++) {
        pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
}

// 加密cookie
function encryptCookie(value, secret) {
    const encrypted = CryptoJS.AES.encrypt(value, secret);
    return encrypted.toString();
}

// 解密cookie
function decryptCookie(value, secret) {
    const decrypted = CryptoJS.AES.decrypt(value, secret);
    return decrypted.toString(CryptoJS.enc.Utf8);
}

// 刷新用户信息
function refreshquota() {
    $.ajax({
        url: "checkuserquota.php?userrndstr=" + userrndstr,
        dataType: "json",
        success: function (data) {
            if (data.success) {
                $("#quota").text(data.quota);
                $("#expiretime").text(data.expiretime);
            }
        },
        error: function (xhr, status, error) {
            setTimeout(refreshquota, 1000);
        }
    });
}

// 个人信息
function showuserinfo() {
    $("#mytitle").html('<div style="display: flex;"><div style="width: 100%; height: 50px;background-color: rgb(79, 128, 225);color: #fff;font-size: 16px;line-height: 50px;text-align: center;">用户信息维护</div></div>');
    $("#mycontent").html("<iframe style='width:100%;height:100%;' src='userinfo.php?userrndstr=" + userrndstr + "' scrolling='no'></iframe>");

    layeruserinfo = layer.open({
        type: 1,
        title: false,
        closeBtn: false,
        area: ['300px', '350px'],
        content: $('#mydialog'),
        shadeClose: true,
    });
}

// 发送
function gogogo(msg) {
    if (msg == '' || msg == ' ' || msg == null || msg == undefined) return false;

    if ($("#quota").text() == "") {
        layer.msg("请登录后再提问，谢谢");
        return;
    }
    if ($("#quota").text() < 1) {
        layer.msg("您的账户余额已不足，请充值后再提问，谢谢");
        return;
    }
    var d1 = new Date($("#expiretime").text());
    d1.setDate(d1.getDate() + 1);
    var today = new Date();
    if (d1 < today) {
        layer.confirm('您的余额已过期，充值任意金额可以延长有效期。<br>充值后查询次数以现有的查询次数为基准进行累加，有效期从今天开始计算进行延长。', {
            btn: ['确定'],
            icon: 3,
            title: '余额过期提示',
        }, function (index) {
            layer.close(index);
            buy();
        });
        return;
    }
    if (freezegogogo) return; //防止短时间内连续点击“发送”按钮造成本函数多次运行而造成不停请求的情况
    freezegogogo = true;

    if (!buttongo) {
        if ($("#modelvalue").val().indexOf("image") < 0) {
            if (timer) {
                clearInterval(timer);
                buttongo = true;
                if (!isalltext) {
                    contextarray.push([encodeURIComponent(prompt), encodeURIComponent(alltext)]);
                    contextarray = contextarray.slice(-5);
                    es.close();
                }
            }
        }
        $("#question").val("");
        $("#question").attr("disabled", false);
        $("#go").text(" 发送 ");
        if (!isMobile()) $("#question").focus();
        refreshquota();
        freezegogogo = false;
    } else {
        prompt = $("#question").val();
        if (prompt == "") {
            layer.msg("请输入您的问题", {
                icon: 5
            });
            return;
        } else {
            if (isquestionfilter) {
                $.ajax({
                    cache: true,
                    type: "POST",
                    url: "keywordfilter.php",
                    data: {
                        text: encodeURIComponent(prompt),
                    },
                    dataType: "json",
                    success: function (data) {
                        if (data.newtext) {
                            $(".home_chat-message-user:last code").text(decodeURIComponent(data.newtext));
                            prompt = decodeURIComponent(data.newtext);
                            preparetoask();
                        }
                    },
                    error: function (xhr, status, error) {
                        layer.msg("您录入的问题触发了防SQL注入检测");
                        return;
                    }
                });
            } else {
                preparetoask();
            }
        }
    }
    freezegogogo = false;
}


function preparetoask() {
    if (isquestionsensor) {
        loading = layer.msg('正在审核您的问题是否合规...', {
            icon: 16,
            shade: 0.4,
            skin: 'layui-layer-molv', //设置皮肤样式
            anim: 2, //设置动画效果
            time: false, //取消自动关闭
            area: ['270px', '60px'], //设置宽度和高度
            offset: '50%', //设置左边距和上边距为50%
            fixed: true, //设置为固定定位
            marginLeft: '-135px', //设置左边距为负的一半宽度
            marginTop: '-30px' //设置上边距为负的一半高度
        });
        $.ajax({
            cache: true,
            type: "POST",
            url: "baiducontentsensor.php",
            data: {
                text: encodeURIComponent(prompt),
            },
            dataType: "json",
            timeout: 5000, // 设置超时时间为5秒
            success: function (data) {
                layer.close(loading);
                loading = 0;
                if (!data.isvalid) {
                    layer.msg("您录入的问题未通过内容审核");
                    return;
                } else {
                    starttoask();
                }
            },
            error: function () {
                layer.close(loading);
                loading = 0;
            }
        });
    } else {
        starttoask();
    }
}

function starttoask() {

    // 取消发送中状态
    $('.home_chat-message-status').remove();
    messageLog();
    // 发送内容写入聊天界面
    buttongo = false;
    answer = randomString(16);

    if ($("#modelvalue").val().indexOf("image") >= 0) {
        tips = "AI正在生成图片中……";
    } else {
        tips = "AI正在思考……";
    }
    ai_output(answer, getMyDate(), $(".mode_js span").text().split("（")[0], tips);
    retrytimes = 0;
    send_post();
}

// 发送消息
function send_post() {
    if ($("#modelvalue").val().indexOf("image") >= 0) {
        tips = "AI正在生成图片中……";
    } else {
        tips = "AI正在思考……";
    }

    $("#question").val(tips);
    $("#question").attr("disabled", true);
    $("#go").text(" 中止 ");

    loading = layer.msg(tips, {
        icon: 16,
        shade: 0.4,
        skin: 'layui-layer-molv', //设置皮肤样式
        anim: 2, //设置动画效果
        time: false, //取消自动关闭
        area: ['250px', '60px'], //设置宽度和高度
        offset: '50%', //设置左边距和上边距为50%
        fixed: true, //设置为固定定位
        marginLeft: '-125px', //设置左边距为负的一半宽度
        marginTop: '-30px' //设置上边距为负的一半高度
    });


    setTimeout("checkloading(" + loading + ");", 60000);

    chat_roll();

    // OpenAI画图
    function draw() {
        $.get("getpicture.php?user=" + userrndstr, function (data) {
            layer.close(loading);
            loading = 0;
            if (layerconfirm) {
                layer.close(layerconfirm);
            }
            if (data.error) {
                var errcode = data.error.code;
                var errmsg = data.error.message;

                errmsg = get_error_msg(errcode, errmsg);
                if ((errcode == "model_not_found") || (errcode == "invalid_user") || (errcode == "out_of_money") || (errcode == "no_valid_apikey") || (errcode == "context_length_exceeded")) {
                    $("#" + answer).html(errmsg);
                } else if (errcode == null) {
                    $("#" + answer).html(errmsg);
                } else if (errcode == "unknown") {
                    $("#" + answer).html(decodeURIComponent(errmsg));
                } else {
                    if (retrytimes < 5) {
                        retrytimes++;
                        send_post();
                    } else {
                        $("#" + answer).html(errmsg);
                    }
                }
                buttongo = true;
                $("#question").val("");
                $("#question").attr("disabled", false);
                $("#go").text(" 发送 ");
                if (!isMobile()) $("#question").focus();
                messageLog();
                chat_roll();
                return;
            } else {
                $("#" + answer).html("<img onload='chat_roll();showpic();' src='pictureproxy.php?url=" + encodeURIComponent(data.data[0].url) + "'>");
                buttongo = true;
                $("#question").val("");
                $("#question").attr("disabled", false);
                $("#go").text(" 发送 ");
                if (!isMobile()) $("#question").focus();
                refreshquota();
                messageLog();
                changeConversationName();
                // refreshhistory();
            }
        }, "json");
    }

    // MJ画图
    function mjdraw() {
        $.get("/plugins/mj/getmjpicture.php?user=" + user_uid + "&rid=" + randomString(10), function (data) {
            try {
                layer.close(loading);
                loading = 0;
                if (layerconfirm) {
                    layer.close(layerconfirm);
                }
                if (data.error) {
                    var errcode = data.error.code;
                    var errmsg = data.error.message;

                    errmsg = get_error_msg(errcode, errmsg);
                    if ((errcode == "model_not_found") || (errcode == "invalid_user") || (errcode == "out_of_money") || (errcode == "mj_fail") || (errcode == "no_valid_apikey") || (errcode == "context_length_exceeded")) {
                        $("#" + answer).html(errmsg);
                    } else if (errcode == null) {
                        $("#" + answer).html(errmsg);
                    } else if (errcode == "unknown") {
                        $("#" + answer).html(decodeURIComponent(errmsg));
                    } else {
                        if (retrytimes < 5) {
                            retrytimes++;
                            send_post();
                        } else {
                            $("#" + answer).html(errmsg);
                        }
                    }
                    buttongo = true;
                    $("#question").val("");
                    $("#question").attr("disabled", false);
                    $("#go").text(" 发送 ");
                    if (!isMobile()) $("#question").focus();
                    messageLog();
                    chat_roll();
                    return;
                } else {
                    $("#" + answer).html("<img onload='chat_roll();' src='pictureproxy.php?url=" + encodeURIComponent(data.data[0].url) + "'>");
                    $("#question").val("图片正在生成中……");
                    refreshquota();
                    messageLog();
                    changeConversationName();
                    refreshmjpic(data.data[0].url);
                }
            } catch (error) {
                $("#" + answer).html("接口返回错误信息：" + data);
                buttongo = true;
                $("#question").val("");
                $("#question").attr("disabled", false);
                $("#go").text(" 发送 ");
                if (!isMobile()) $("#question").focus();
                messageLog();
                chat_roll();
                return;
            }
        }, "json");
    }

    // 对话
    function streaming() {
        isstarted = true;
        isalltext = false;
        alltext = "";
        try {
            es.close(); //EventSource有时会间隔3秒自动重连，并且不触发error事件。这行代码可以结束上一次死循环的连接。
        } catch (e) { }
        es = new EventSource("stream.php?user=" + userrndstr);
        es.onerror = function (event) {
            layer.close(loading);
            loading = 0;
            if (layerconfirm) {
                layer.close(layerconfirm);
            }
            es.close();
            buttongo = true;
            $("#" + answer).html("服务器访问超时或网络错误");
            $("#question").val("");
            $("#question").attr("disabled", false);
            $("#go").text(" 发送 ");
            if (!isMobile()) $("#question").focus();
            return;
        }
        es.onmessage = function (event) {

            if (event.data == "[DONE]") {
                isalltext = true;
                contextarray.push([encodeURIComponent(prompt), encodeURIComponent(alltext)]);
                contextarray = contextarray.slice(-5); //只保留最近5次对话作为上下文，以免超过最大tokens限制
                es.close();
                return;
            }
            try {
                json = JSON.parse(event.data);
                if (json.hasOwnProperty("error")) { //处理错误信息

                    layer.close(loading);
                    loading = 0;
                    if (layerconfirm) {
                        layer.close(layerconfirm);
                    }
                    var errcode = json.error.code;
                    var errmsg = json.error.message;

                    errmsg = get_error_msg(errcode, errmsg);
                    es.close();
                    if ((errcode == "model_not_found") || (errcode == "invalid_user") || (errcode == "out_of_money") || (errcode == "no_valid_apikey") || (errcode == "context_length_exceeded")) {
                        $("#" + answer).html(errmsg);
                    } else if (errcode == null) {
                        $("#" + answer).html(errmsg);
                    } else if (errcode == "unknown") {
                        $("#" + answer).html(decodeURIComponent(errmsg));
                    } else {
                        if (retrytimes < 5) {
                            retrytimes++;
                            send_post();
                        } else {
                            $("#" + answer).html(errmsg);
                        }
                    }
                    isalltext = true;
                    buttongo = true;
                    $("#question").val("");
                    $("#question").attr("disabled", false);
                    $("#go").text(" 发送 ");
                    if (!isMobile()) $("#question").focus();
                    return;
                } else if (json.result) { //百度文心千帆处理正常流程
                    if (alltext == "") {
                        alltext = json.result.replace(/^\n+/, '');
                    } else {
                        alltext += json.result;
                    }
                } else if (json.choices[0].delta.hasOwnProperty("content")) { //处理正常流程的data
                    if (alltext == "") {
                        alltext = json.choices[0].delta.content.replace(/^\n+/, '');
                    } else {
                        alltext += json.choices[0].delta.content;
                    }
                } else if (json.choices[0].finish_reason == "stop") { //处理正常流程结束标志
                    isalltext = true;
                    contextarray.push([encodeURIComponent(prompt), encodeURIComponent(alltext)]);
                    contextarray = contextarray.slice(-5);
                    es.close();
                    return;
                }

                if (isstarted) {
                    userScrolling = false;
                    isstarted = false;
                    layer.close(loading);
                    loading = 0;
                    if (layerconfirm) {
                        layer.close(layerconfirm);
                    }
                    str_ = '';
                    i = 0;
                    strforcode = '';
                    timewait = 30;
                    timer = setInterval(() => {
                        if (previousScrollPosition > $('.home_chat-body').prop("scrollTop")) {
                            userScrolling = true;
                        } else if ($('.home_chat-body').prop("scrollTop") == $('.home_chat-body').prop("scrollHeight")) {
                            userScrolling = false;
                        }
                        let newalltext = alltext;
                        let islastletter = false;
                        //有时服务器错误地返回\\n作为换行符，尤其是包含上下文的提问时，这行代码可以处理一下。
                        if (newalltext.split("\n").length == 1) {
                            newalltext = newalltext.replace(/\\n/g, '\n');
                        }
                        //用newalltext.length - 3是因为如果服务端返回\\n或\n时拆成两条消息了，str_会把单个\当成字符。
                        if (str_.length < (newalltext.length - 3)) {
                            str_ += newalltext[i++];
                            strforcode = str_;
                            if ((str_.split("```").length % 2) == 0) {
                                strforcode += "\n```\n";
                            } else {
                                strforcode += "_";
                            }
                            if ((newalltext.length - 3 - str_.length) > 10) {
                                timewait = 20;
                            }
                            if ((newalltext.length - 3 - str_.length) > 20) {
                                timewait = 10;
                            }
                            if ((newalltext.length - 3 - str_.length) > 30) {
                                timewait = 5;
                            }
                            if ((newalltext.length - str_.length) > 50) {
                                str_ = newalltext.slice(0, -50);
                                i = str_.length;
                            }
                        } else {
                            if (isalltext) {
                                clearInterval(timer);
                                strforcode = newalltext;
                                if (isanswersensor) {
                                    loading = layer.msg('正在审核AI的回答是否合规...', {
                                        icon: 16,
                                        shade: 0.4,
                                        skin: 'layui-layer-molv', //设置皮肤样式
                                        anim: 2, //设置动画效果
                                        time: false, //取消自动关闭
                                        area: ['270px', '60px'], //设置宽度和高度
                                        offset: '50%', //设置左边距和上边距为50%
                                        fixed: true, //设置为固定定位
                                        marginLeft: '-135px', //设置左边距为负的一半宽度
                                        marginTop: '-30px' //设置上边距为负的一半高度
                                    });
                                    $.ajax({
                                        cache: true,
                                        type: "POST",
                                        url: "baiducontentsensor.php",
                                        data: {
                                            text: encodeURIComponent(strforcode),
                                        },
                                        dataType: "json",
                                        timeout: 5000, // 设置超时时间为5秒
                                        success: function (data) {
                                            layer.close(loading);
                                            loading = 0;
                                            if (layerconfirm) {
                                                layer.close(layerconfirm);
                                            }
                                            if (!data.isvalid) {
                                                strforcode = "AI的回答未通过内容审核！";
                                                renderhtml(strforcode);
                                            }
                                        },
                                        error: function () {
                                            layer.close(loading);
                                            loading = 0;
                                            if (layerconfirm) {
                                                layer.close(layerconfirm);
                                            }
                                        }
                                    });
                                }
                                renderhtml(strforcode);

                                islastletter = true;
                                buttongo = true;
                                $("#question").val("");
                                $("#question").attr("disabled", false);
                                $("#go").text(" 发送 ");
                                if (!isMobile()) $("#question").focus();
                                refreshquota();
                                messageLog();
                                changeConversationName();

                                if ($('#' + $.cookie('check_id') + ' .home_chat-item-title').text() == '新的聊天') {
                                    $('.home_export-content').html('###' + prompt);
                                }
                                mathjaxstr = (strforcode.split("$").length > 2) ? '<div class="home_chat-message-top-action" onclick="show_mathjax(this)">显示公式</div>' : '';
                                $("#" + answer).prev().html(mathjaxstr + $("#" + answer).prev().html());
                                $('.home_export-content').append("\r\n## 来自 你 的消息:\r\n" + prompt);
                                $('.home_export-content').append("\r\n## 来自 AI 的消息:\r\n" + mdHtml.render(strforcode));
                            }
                        }
                        renderhtml(strforcode);
                        previousScrollPosition = $('.home_chat-body').prop("scrollTop");
                    }, timewait);
                }
                if (json.is_end) { //百度文心千帆处理正常流程结束标志
                    isalltext = true;
                    contextarray.push([encodeURIComponent(prompt), encodeURIComponent(alltext)]);
                    contextarray = contextarray.slice(-5);
                    es.close();
                    return;
                }
            } catch (e) {
                layer.close(loading);
                loading = 0;
                if (layerconfirm) {
                    layer.close(layerconfirm);
                }
                isalltext = true;
                buttongo = true;
                es.close();
                $("#" + answer).html("异常错误：" + event.data);
                $("#question").val("");
                $("#question").attr("disabled", false);
                $("#go").text(" 发送 ");
                if (!isMobile()) $("#question").focus();
                return;
            }
        }

        // if (contextarray.length == 0) {
        //     conversationid = Date.now();
        // }
    }
    $.ajax({
        cache: true,
        type: "POST",
        url: "setsession.php",
        data: {
            message: encodeURIComponent(prompt),
            model: $("#model").val(),
            role: $("#role").val(),
            context: JSON.stringify(contextarray),
            user: userrndstr,
            conversationid: conversationid,
        },
        dataType: "json",
        success: function (data) {
            if (data.success) {
                if ($("#modelvalue").val() == "midjourney_image") {
                    mjdraw();
                } else if ($("#modelvalue").val().indexOf("image") >= 0) {
                    draw();
                } else {
                    streaming();
                }
            } else {
                $.removeCookie('userrndstr');
                layer.alert('您已在其他地方扫码登录过，本地保存的登录信息已失效。', {
                    icon: 2,
                    btn: ['确定'],
                    closeBtn: 0,
                    yes: function () {
                        location.reload();
                    }
                });
            }
        }
    });
}

function showpic() {
    $(".markdown-body").on("click", "img", function () {
        var imageUrl = $(this).attr("src");
        $(".overlay img").attr("src", imageUrl);
        $(".overlay").fadeIn();
        $("body").css("overflow", "hidden");
    });

    $(".overlay").click(function () {
        $(".overlay").fadeOut();
        $("body").css("overflow", "auto");
    });
}
function refreshmjpic(lastpic) {
    $.get("/plugins/mj/apiproxy.php?user=" + user_uid + "&rid=" + randomString(10), function (data) {
        if (data.error) {
            var errcode = data.error.code;
            var errmsg = data.error.message;
            errmsg = get_error_msg(errcode, errmsg);
            $("#" + answer).html(errmsg);
            buttongo = true;
            $("#question").val("");
            $("#question").attr("disabled", false);
            $("#go").text(" 发送 ");
            if (!isMobile()) $("#question").focus();
            messageLog();
            chat_roll();
            return;
        } else {
            if (!data.data[1]) {
                if (lastpic != data.data[0].url) {
                    $("#" + answer).html("<img onload='chat_roll();' src='pictureproxy.php?url=" + encodeURIComponent(data.data[0].url) + "'>");
                }
                setTimeout("refreshmjpic('" + data.data[0].url + "');", 2000);
            } else {
                $("#" + answer).html("<img onload='chat_roll();showpic();' src='" + data.data[0].url + "'><img onload='chat_roll();' src='" + data.data[1].url + "'><img onload='chat_roll();' src='" + data.data[2].url + "'><img onload='chat_roll();' src='" + data.data[3].url + "'>");
                buttongo = true;
                $("#question").val("");
                $("#question").attr("disabled", false);
                $("#go").text(" 发送 ");
                if (!isMobile()) $("#question").focus();
            }
        }
    }, "json");
}

// 历史记录
function refreshhistory(more = 0) {
    $.ajax({
        url: "getuserconversation.php?type=all&userrndstr=" + userrndstr + "&more=" + more,
        dataType: "json",
        async: false,
        success: function (data) {
            if (data.success) {
                if (more == 0) {
                    $('.home_sidebar-body').html('');
                }
                $.each(data.conversation, function (k, v) {
                    if (v.id == $.cookie('check_id')) check_chat_exist = true;
                    chat_append(v.id, v.question, v.num, v.realtime);
                })
                if (more == 0) {
                    if ($.cookie('check_id') == undefined || check_chat_exist == false) $.cookie('check_id', (data.conversation[0].id));
                    showconversation($.cookie('check_id'));
                } else {
                    $('#' + $.cookie('check_id')).addClass('home_chat-item-selected').siblings().removeClass("home_chat-item-selected");
                }
                nextrefreshhistorytime = more + 1;
            } else {
                if (more == 0) {
                    create_chat();
                } else {
                    $('.home_sidebar-body').append('<div style="color:red;text-align:center;" class="home_chat-item home_chat-item-selected" onclick="deleteallconversation();">删除所有对话记录</div>');
                    $('#' + $.cookie('check_id')).addClass('home_chat-item-selected').siblings().removeClass("home_chat-item-selected");
                }
            }
        },
        complete: function () {
            // alert('数据更新完成')
            // location.reload();
        },
        error: function (xhr, status, error) {
            // setTimeout(refreshhistory, 1000);
        }
    });
}

function deleteconversation(itemId) {
    event.stopPropagation();//禁止父级事件
    if ($('.home_sidebar-body').children().length <= 1) return false;

    layer.confirm('确定要删除吗？', {
        btn: ['确定', '取消'],
        icon: 3,
        title: '确认删除',
    }, function (index) {
        layer.close(index);
        $.ajax({
            url: "deluserconversation.php?type=single&conversationid=" + itemId + "&userrndstr=" + userrndstr,
            dataType: "json",
            success: function (data) {
                if (data.success) {
                    //更新元素
                    var check_id = $('#' + itemId).siblings(":first").attr('id');//异常，不生效，立即被覆盖
                    // showconversation($('#'+chat_id).siblings(":first"));
                    $('#' + itemId).siblings(":first").addClass('home_chat-item-selected');
                    $('#' + itemId).remove();

                    $.cookie('check_id', check_id);
                    conversationid = check_id;
                    showconversation(check_id);
                    // refreshhistory();
                } else {
                    layer.msg(data.message);
                }
            },
            error: function (xhr, status, error) {
                layer.msg("网络错误或程序错误，请刷新重试。若一直无法成功，请联系管理员。");
            }
        });
    });
}

function deleteallconversation() {
    event.stopPropagation();//禁止父级事件
    if ($('.home_sidebar-body').children().length <= 1) return false;

    layer.confirm('确定要删除所有对话记录吗？', {
        btn: ['确定', '取消'],
        icon: 3,
        title: '确认删除',
    }, function (index) {
        layer.close(index);
        $.ajax({
            url: "deluserconversation.php?type=all&userrndstr=" + userrndstr,
            dataType: "json",
            success: function (data) {
                if (data.success) {
                    location.reload();
                } else {
                    layer.msg(data.message);
                }
            },
            error: function (xhr, status, error) {
                layer.msg("网络错误或程序错误，请刷新重试。若一直无法成功，请联系管理员。");
            }
        });
    });
}

function showconversation(id) {
    $.cookie('check_id', id);
    if ($.cookie('model')) $('#model').val($.cookie('model'));
    if ($.cookie('modelvalue')) $('#modelvalue').val($.cookie('modelvalue'));
    if ($.cookie('modelname')) $('.mode_js').children('span').text($.cookie('modelname'));
    if ($.cookie('role')) $('#role').val($.cookie('role'));
    if ($.cookie('rolename')) $('.role_js').children('span').text($.cookie('rolename'));

    $('#' + id).addClass('home_chat-item-selected').siblings().removeClass("home_chat-item-selected");
    $('.home_sidebar').toggleClass('home_sidebar-show');

    $.ajax({
        url: "getuserconversation.php?type=single&conversationid=" + id + "&userrndstr=" + userrndstr,
        dataType: "json",
        success: function (data) {
            if (data.success) {
                $('.window-header-main-title').html(data.conversation.length ? data.conversation[0].question : '新的聊天');
                $('.home_export-content').html('###' + (data.conversation.length ? data.conversation[0].question : '新的聊天'));
                $('#chat_msg_count').html(data.conversation.length * 2);
                $('.home_chat-body').html('');
                conversationid = id;
                contextarray = [];

                $.each(data.conversation, function (k, v) {
                    answer = randomString(16);
                    user_output(v.question);
                    ai_output(answer, v.realtime, v.model);
                    $('.home_export-content').append("\r\n## 来自 你 的消息:\r\n" + v.question);
                    $('.home_export-content').append("\r\n## 来自 AI 的消息:\r\n" + mdHtml.render(v.answer));

                    mathjaxstr = (v.answer.split("$").length > 2) ? '<div class="home_chat-message-top-action" onclick="show_mathjax(this)">显示公式</div>' : '';
                    $("#" + answer).prev().html(mathjaxstr + $("#" + answer).prev().html());
                    temptext = v.answer;
                    contextarray.push([encodeURIComponent(v.question), encodeURIComponent(v.answer)]);
                    contextarray = contextarray.slice(-5); //只保留最近5次对话作为上下文，以免超过最大tokens限制
                    if (temptext.split("\n").length == 1) {
                        temptext = temptext.replace(/\\n/g, '\n');
                    }
                    temptext = mdHtml.render(temptext);
                    $("#" + answer).html(temptext);
                    $("#" + answer + " pre code").each(function () {
                        $(this).html("<i style='float:right;cursor:pointer' class='layui-icon layui-icon-file copy_code'></i>" + $(this).html());
                    });
                    document.body.scrollTop = document.body.scrollHeight;
                });
                if ($("#question").val().length > 0) {
                    user_output($("#question").val(), true);
                }
                chat_roll();
                showpic();
            } else {
                $.removeCookie('userrndstr');
                layer.alert('您已在其他地方扫码登录过，本地保存的登录信息已失效。', {
                    icon: 2,
                    btn: ['确定'],
                    closeBtn: 0,
                    yes: function () {
                        location.reload();
                    }
                });
            }
        },
        error: function (xhr, status, error) {
            setTimeout(showconversation(id), 1000);
        }
    });
}

function changeConversationName() {
    if ($('#' + $.cookie('check_id') + ' .home_chat-item-title').text() == '新的聊天') {
        var one_msg = $('.home_chat-body code:first').text();
        $('#' + $.cookie('check_id') + ' .home_chat-item-title').text(one_msg);
        $('.window-header-main-title').text(one_msg);
    }
}

function download_msg() {

    var downfile = new File(
        [$('.home_export-content').text()],
        $('.window-header-main-title').text() + ".md",
        { type: "text/plain" });

    var tmpLink = document.createElement("a");
    var objectUrl = URL.createObjectURL(downfile);

    tmpLink.href = objectUrl;
    tmpLink.download = downfile.name;
    document.body.appendChild(tmpLink);
    tmpLink.click();

    document.body.removeChild(tmpLink);
    URL.revokeObjectURL(objectUrl);
}

function setCookie(name, value) {
    var date = new Date();
    date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000)); // 一年的毫秒数
    var expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookie(name) {
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].trim();
        if (cookie.indexOf(name + '=') === 0) {
            return cookie.substring(name.length + 1, cookie.length);
        }
    }
    return null;
}

// 返回消息格式化
function renderhtml(strforcode) {
    $("#" + answer).html(mdHtml.render(strforcode));
    $("#" + answer + " pre code").each(function () {
        $(this).html("<i style='float:right;cursor:pointer' class='layui-icon layui-icon-file copy_code'></i>" + $(this).html());
    });

    if (!userScrolling) {
        chat_roll();
    }
}

function isMobile() {
    const userAgent = navigator.userAgent.toLowerCase();
    const mobileKeywords = ['iphone', 'ipod', 'ipad', 'android', 'windows phone', 'blackberry', 'nokia', 'opera mini', 'mobile'];
    for (let i = 0; i < mobileKeywords.length; i++) {
        if (userAgent.indexOf(mobileKeywords[i]) !== -1) {
            return true;
        }
    }
    return false;
}

function rechargebycard() {
    $.ajax({
        url: "rechargebycard.php?cardpass=" + $("#cardpass").val() + "&userrndstr=" + userrndstr,
        dataType: "json",
        success: function (data) {
            if (data.success) {
                refreshquota();
                layer.msg("充值成功");
            } else {
                layer.msg(data.message);
            }
        },
        error: function (xhr, status, error) {
            layer.msg("网络错误或程序错误，请刷新重试。若一直无法成功，请联系管理员。");
        }
    });
}

// 根据错误码返回信息
function get_error_msg(errcode, errmessage) {
    switch (errcode) {
        case "model_not_found":
            errmsg = "没有使用此模型的权限";
            break;
        case "invalid_user":
            errmsg = "用户不存在或已在其他地方登录";
            break;
        case "out_of_money":
            errmsg = "账户余额不足，请充值";
            break;
        case "billing_hard_limit_reached":
            errmsg = "API_KEY账户余额不足，请联系网站管理员";
            break;
        case "no_valid_apikey":
            errmsg = "系统中未配置可用的API_KEY";
            break;
        case "invalid_api_key":
            errmsg = "API-KEY不合法";
            break;
        case "context_length_exceeded":
            errmsg = "问题和上下文长度超限，请重新提问或刷新页面再提问";
            break;
        case "rate_limit_reached":
            errmsg = "同时访问用户过多，请稍后再试";
            break;
        case "rate_limit_exceeded":
            errmsg = "超过了API_KEY的访问频率限制";
            break;
        case "access_terminated":
            errmsg = "违规使用，API-KEY被封禁";
            break;
        case "no_api_key":
            errmsg = "未提供API-KEY";
            break;
        case "insufficient_quota":
            errmsg = "API-KEY余额不足";
            break;
        case "account_deactivated":
            errmsg = "账户已禁用";
            break;
        case "model_overloaded":
            errmsg = "OpenAI模型超负荷，请重新发起请求";
            break;
        case "server_overloaded":
            errmsg = "OpenAI服务器超负荷，请重新发起请求";
            break;
        case "sql_injection":
            errmsg = "您的提问触发了SQL注入攻击防护机制，请修改下问题重新提问";
            break;
        case "mj_fail":
            errmsg = "MJ图片生成失败，请确认您的提示词不违规并稍后再试";
            break;
        default:
            errmsg = "错误类型：" + errcode + "<br>错误详情：" + errmessage;
    }
    return errmsg;
}

function showwxpayqrcode() {
    var productid = $('#productid').val();
    if (productid == "") {
        layer.msg("请选择充值卡类型");
        return false;
    }
    layer.close(buylayer);
    buylayer = 0;
    var isWechat = /MicroMessenger/i.test(navigator.userAgent);
    if (isWechat) {
        location.href = window.location.protocol + "//" + window.location.hostname + "/wxpay.php?m=1&p=" + productid + "&s=" + userrndstr;
    } else if (isMobile()) {
        $("#mytitle").html("请用微信扫码支付");
        $("#mycontent").html("");
        $("#mycontent").qrcode(window.location.protocol + "//" + window.location.hostname + "/wxpay.php?p=" + productid + "&s=" + userrndstr);
        $("#mycontent").append("<p>您可以截图后在微信中识别二维码支付，或将下面的付款链接复制到微信中打开。</p><p style='word-break:break-all;' class='copy_p'>" + window.location.protocol + "//" + window.location.hostname + "/wxpay.php?p=" + productid + "&s=" + userrndstr + "</p>");

        layerqrcode = layer.open({
            type: 1,
            title: false,
            closeBtn: false,
            area: ['300px', '440px'],
            offset: ['calc(50% - 220px)', 'calc(50% - 150px)'],
            content: $('#mydialog'),
            shadeClose: true,
            success: function (layero, index) {
                // 点击任意区域自动隐藏
                layero.on('click', function () {
                    layer.close(index);
                });
            }
        });
        currentTime = new Date().toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
            timeZone: 'Asia/Shanghai'
        }).replace(/\//g, '-').replace(',', '');
        checkwxpaystatus();
    } else {
        $("#mycontent").html("");
        $("#mycontent").qrcode(window.location.protocol + "//" + window.location.hostname + "/wxpay.php?p=" + productid + "&s=" + userrndstr);

        $("#mytitle").html("请用微信扫码支付");
        layerqrcode = layer.open({
            type: 1,
            title: false,
            closeBtn: false,
            area: ['300px', '350px'],
            offset: ['calc(50% - 175px)', 'calc(50% - 150px)'],
            content: $('#mydialog'),
            shadeClose: true,
            success: function (layero, index) {
                // 点击任意区域自动隐藏
                layero.on('click', function () {
                    layer.close(index);
                });
            }
        });
        currentTime = new Date().toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
            timeZone: 'Asia/Shanghai'
        }).replace(/\//g, '-').replace(',', '');
        checkwxpaystatus();
    }
}

function showalipayqrcode() {
    var productid = $('#productid').val();
    if (productid == "") {
        layer.msg("请选择充值卡类型");
        return false;
    }
    layer.close(buylayer);
    buylayer = 0;

    $.get("alipayqrcodeurl.php?p=" + productid + "&s=" + userrndstr, function (data) {
        if (data.error) {
            alipayqrcodeurl = '支付宝后台参数配置不正确，请联系管理员。错误提示：' + data.errmsg;
        } else {
            alipayqrcodeurl = data.alipayqrcodeurl;
        }

        var isWechat = /MicroMessenger/i.test(navigator.userAgent);
        if (isWechat) {
            $("#mytitle").html("使用支付宝付款");
            if (/iPhone/i.test(navigator.userAgent)) {
                $("#mycontent").html("<p style='font-size:18px;text-align:left;line-height:35px;'>点击下面的链接即可复制网址，在手机浏览器中访问即可跳转到支付宝进行支付。</p><p style='font-size:18px;text-align:left;line-height:35px;color:#000080;word-break:break-all;' onclick='location.href=\"" + alipayqrcodeurl + "\";'>" + alipayqrcodeurl + "</p>");
            } else {
                $("#mycontent").html("<p style='font-size:18px;text-align:left;line-height:35px;'>点击下面的链接即可复制网址，在手机浏览器中访问即可跳转到支付宝进行支付。</p><p style='font-size:18px;text-align:left;line-height:35px;color:#000080;word-break:break-all;' class='copy_p'>" + alipayqrcodeurl + "</p>");
            }
            layerqrcode = layer.open({
                type: 1,
                title: false,
                closeBtn: false,
                area: ['300px', '350px'],
                offset: ['calc(50% - 175px)', 'calc(50% - 150px)'],
                content: $('#mydialog'),
                shadeClose: true,
            });
        } else if (isMobile()) {
            $("#mytitle").html("使用支付宝付款");
            $("#mycontent").html("<p style='font-size:18px;text-align:left;line-height:35px;'>点击下面的链接即可跳转到支付宝进行支付。</p><p style='font-size:18px;text-align:left;line-height:35px;color:#000080;word-break:break-all;' onclick='location.href=\"" + alipayqrcodeurl + "\";'>" + alipayqrcodeurl + "</p>");
            layerqrcode = layer.open({
                type: 1,
                title: false,
                closeBtn: false,
                area: ['300px', '350px'],
                offset: ['calc(50% - 175px)', 'calc(50% - 150px)'],
                content: $('#mydialog'),
                shadeClose: true,
            });
        } else {
            $("#mytitle").html("请用支付宝扫码支付");
            $("#mycontent").html("");
            $("#mycontent").qrcode(alipayqrcodeurl);
            layerqrcode = layer.open({
                type: 1,
                title: false,
                closeBtn: false,
                area: ['300px', '350px'],
                offset: ['calc(50% - 175px)', 'calc(50% - 150px)'],
                content: $('#mydialog'),
                shadeClose: true,
                success: function (layero, index) {
                    // 点击任意区域自动隐藏
                    layero.on('click', function () {
                        layer.close(index);
                    });
                }
            });
        }
        currentTime = new Date().toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
            timeZone: 'Asia/Shanghai'
        }).replace(/\//g, '-').replace(',', '');
        checkalipaystatus();
    }, "json");
}

function showrechargecard() {
    $("#buypanel").html('<div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height:100%;"><input type="text" id="cardpass" placeholder="充值卡密码" maxlength="20" style="width: 80%; padding: 10px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 5px; font-size: 16px;" oninput="this.value=this.value.replace(/\\s+/g,\'\')"><button onclick="rechargebycard();" style="background-color: #007bff; color: #fff; border: none; padding: 10px 20px; margin:20px; font-size: 16px; cursor: pointer;">充值</button></div>');
}

function gotoshop() {
    var productid = $('#productid').val();
    if (productid == "") {
        layer.msg("请选择充值卡类型");
        return false;
    }
    showrechargecard();
    window.open('shop.php?p=' + productid, '_blank');
}
function checkwxpaystatus() {
    $.ajax({
        url: "checkwxpaystatus.php?userrndstr=" + userrndstr + "&begintime=" + currentTime + "&rid=" + randomString(10),
        dataType: "json",
        success: function (data) {
            if (data.success) {
                if ($('.layui-layer-shade').length) {
                    layer.close(layerqrcode);
                }
                refreshquota();
            } else {
                if ($('.layui-layer-shade').length) {
                    setTimeout(checkwxpaystatus, 1000);
                }
            }
        },
        error: function (xhr, status, error) {
            setTimeout(checkwxpaystatus, 1000);
        }
    });
}
function checkalipaystatus() {
    $.ajax({
        url: "checkalipaystatus.php?userrndstr=" + userrndstr + "&begintime=" + currentTime + "&rid=" + randomString(10),
        dataType: "json",
        success: function (data) {
            if (data.success) {
                if ($('.layui-layer-shade').length) {
                    layer.close(layerqrcode);
                }
                refreshquota();
            } else {
                if ($('.layui-layer-shade').length) {
                    setTimeout(checkalipaystatus, 1000);
                }
            }
        },
        error: function (xhr, status, error) {
            setTimeout(checkalipaystatus, 1000);
        }
    });
}

function checkloading(nowloading) {
    if (loading == nowloading) {
        layerconfirm = layer.confirm('已等待超过1分钟，是否中止本次提问？', {
            btn: ['中止提问', '再等一分钟'],
            icon: 3,
            closeBtn: 0,
            title: '确认删除',
            offset: '50%',
        }, function (index) {
            layer.close(index);
            loading = 0;
            buttongo = true;
            $("#question").val("");
            $("#question").attr("disabled", false);
            $("#go").text(" 发送 ");
            if (!isMobile()) $("#question").focus();
            layerconfirm = 0;
        }, function (index) {
            if ((!buttongo) && (loading != 0)) {
                loading = layer.msg('AI正在思考，请稍等片刻...', {
                    icon: 16,
                    shade: 0.4,
                    skin: 'layui-layer-molv', //设置皮肤样式
                    anim: 2, //设置动画效果
                    time: false, //取消自动关闭
                    area: ['250px', '60px'], //设置宽度和高度
                    offset: '50%', //设置左边距和上边距为50%
                    fixed: true, //设置为固定定位
                    marginLeft: '-125px', //设置左边距为负的一半宽度
                    marginTop: '-30px' //设置上边距为负的一半高度
                });
                setTimeout("checkloading(" + loading + ");", 60000);
                layerconfirm = 0;
            } else {
                layerconfirm = 0;
            }
        });
    }
}

function showshare() {
    if (!user_uid) {
        layer.msg("请在登录后查看详情");
        return;
    }
    $("#mytitle").html("邀请有礼");
    $("#mycontent").html("<p style='font-size:18px;text-align:left;line-height:35px;'>您的好友使用以下链接访问本站并登录后，您和您的好友将各获得" + freetryshare + "次查询次数。</p><p id='shareurl' style='word-break:break-all;font-size:18px;text-align:left;line-height:35px;color:#000080;' class='copy_p'>" + window.location.protocol + "//" + window.location.hostname + "/index.php?i=" + user_uid + "</p><p onclick='downloadQRCode();' style='border:1px solid;width:160px;position:absolute;bottom:20px;left:calc(50% - 80px);font-size:18px;text-align:center;line-height:35px;'>点击下载二维码</p>");
    layershare = layer.open({
        type: 1,
        title: false,
        closeBtn: false,
        area: ['300px', '350px'],
        offset: ['calc(50% - 175px)', 'calc(50% - 150px)'],
        content: $('#mydialog'),
        shadeClose: true,
    });
}

function togglefullscreen() {
    $('.home_container:first').toggleClass('home_tight-container');
    $('.max_min i').toggleClass('layui-icon-screen-restore');
    if ($.cookie('fullscreen')) {
        $.removeCookie('fullscreen');
    } else {
        $.cookie('fullscreen', 1);
    }
}

function browse_chat() {
    if ($("#quota").text() == "") {
        layer.msg("请登录后再查看");
        return;
    }
    layer.open({
        type: 1,
        title: '全部登录及对话日志',
        area: ['95%', '95%'],
        shade: 0.5,
        scrollbar: true,
        fixed: true, //设置为固定定位
        offset: '2.5%',
        content: '<iframe src="showlog.php?userrndstr=' + userrndstr + "&rid=" + new Date().getTime() + '" style="width: 100%; height: 100%;"></iframe>'
    });
}

function downloadQRCode() {
    var tempurl = $("#shareurl").text();
    $("#mycontent").html("");
    $("#mycontent").qrcode(tempurl);
    var isWechat = /MicroMessenger/i.test(navigator.userAgent);
    if (isWechat) {
        var img = document.createElement("img");
        img.src = $("#mycontent").find("canvas")[0].toDataURL("image/png");
        $("#mycontent").html(img);
        layer.msg("长按二维码图片保存到本地");
    } else {
        var link = document.createElement("a");
        link.href = $("#mycontent").find("canvas")[0].toDataURL("image/png");
        link.download = "qrcode.png";
        link.click();
    }
}