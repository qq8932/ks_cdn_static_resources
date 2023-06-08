
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
var previousScrollHeight = 0;

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

mdHtml.renderer.rules.table_open = function () {
    return '<table class="table table-striped">\n';
};

mdHtml.renderer.rules.paragraph_open = function (tokens, idx) {
    var line;
    if (tokens[idx].lines && tokens[idx].level === 0) {
        line = tokens[idx].lines[0];
        return '<p class="line" data-line="' + line + '">';
    }
    return '<p>';
};

mdHtml.renderer.rules.heading_open = function (tokens, idx) {
    var line;
    if (tokens[idx].lines && tokens[idx].level === 0) {
        line = tokens[idx].lines[0];
        return '<h' + tokens[idx].hLevel + ' class="line" data-line="' + line + '">';
    }
    return '<h' + tokens[idx].hLevel + '>';
};


$(document).ready(function () {

    $("#question").on('keydown', function (event) {
        if (event.keyCode == 13) {
            gogogo();
            return false;
        }
    });

    $('.show-history').click(function () {
        $(".history").show();
        $("#main").toggleClass("goright");
        $(".show-history").hide();

    });
    $('.hide-history').click(function () {
        $(".history").hide();
        $("#main").toggleClass("goright");
        $(".show-history").show();

    });

    if ($.cookie('userrndstr')) {
        userrndstr = decryptCookie($.cookie('userrndstr'), 'ChatGPT');
        checkuserstatus();
    } else {
        userrndstr = randomString(16) + new Date().getTime();
    }

    $("#showlog").click(function () {
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
        return false;
    });

});

function checkuserstatus() {
    $.ajax({
        url: "checkuserstatus.php?rid=" + randomString(10) + "&userrndstr=" + userrndstr,
        dataType: "json",
        success: function (data) {
            if (data.success) {
                user_uid = data.uid;
                user_email = data.email;
                $("#rightbanner").html('<span style="text-decoration:none;cursor:pointer;" onclick="showuserinfo();">用户信息</span><span style="margin:0 10px;"></span><span class=" hover:text-blue-500 dark:hover:text-blue-400" style="text-decoration:none;cursor:pointer;" onclick="buy();">充值</span><span style="margin:0 10px;"></span><span class=" hover:text-blue-500 dark:hover:text-blue-400" style="text-decoration:none;cursor:pointer;" onclick="logout();">退出</span>');
                if (typeof layerqrcode !== "undefined") layer.close(layerqrcode);
                if (data.email == "") showuserinfo();

                // 设置cookie
                $.cookie('userrndstr', encryptCookie(userrndstr, 'ChatGPT'), {
                    expires: 30,
                    path: '/'
                });
                refreshquota();
                $("#userpanel").css("display", "flex");
                $(".show-history").show();
                refreshhistory();
            } else {
                if ($.cookie('userrndstr')) {
                    $.cookie('userrndstr', '', {
                        expires: 0,
                        path: '/'
                    });
                    layer.alert('您已在其他地方扫码登录过，本地保存的登录信息已失效。', {
                        icon: 2,
                        btn: ['确定'],
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

function showuserinfo() {
    $("#mytitle").html('<div style="display: flex;"><div style="width: 100%; height: 50px;background-color: rgb(79, 128, 225);color: #fff;font-size: 16px;line-height: 50px;text-align: center;">用户信息维护</div></div>');
    $("#mycontent").html("<iframe style='width:100%;height:100%;' src='userinfo.php?userrndstr=" + userrndstr + "' scrolling='no'></iframe>");

    layerqrcode = layer.open({
        type: 1,
        title: false,
        closeBtn: false,
        area: ['300px', '350px'],
        content: $('#mydialog'),
        shadeClose: true,
    });
}

function refreshhistory() {
    $.ajax({
        url: "getuserconversation.php?type=all&userrndstr=" + userrndstr,
        dataType: "json",
        success: function (data) {
            if (data.success) {
                $("#conversation").html("");
                for (var i = 0; i < data.conversation.length; i++) {
                    $("#conversation").prepend('<li class="list-group-item list-group-item-action" style="padding-right:40px;overflow:hidden; position:relative;"><i class="fa fa-comments-o"></i><span style="margin-left:10px;cursor:pointer;" onclick="showconversation(\'' + data.conversation[i].id + '\');">' + data.conversation[i].question + '</span><i onclick="deleteconversation(\'' + data.conversation[i].id + '\',event);" class="fa fa-trash-o" style="position:absolute; right:20px;top:18px;cursor:pointer;"></i></li>');
                }
            } else {
                $("#conversation").html('<li class="list-group-item list-group-item-action" style="text-align:center;">无历史对话，请开始提问吧</li>');
            }
        },
        error: function (xhr, status, error) {
            setTimeout(refreshhistory, 1000);
        }
    });
}

function deleteconversation(itemId, event) {
    var x = event.clientX - 177;
    var y = event.clientY - 133;
    layer.confirm('确定要删除吗？', {
        btn: ['确定', '取消'],
        icon: 3,
        title: '确认删除',
        offset: [y + 'px', x + 'px']
    }, function (index) {
        layer.close(index);
        $.ajax({
            url: "deluserconversation.php?type=single&conversationid=" + itemId + "&userrndstr=" + userrndstr,
            dataType: "json",
            success: function (data) {
                if (data.success) {
                    refreshhistory();
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

function deleteallhistory() {
    layer.confirm('清空对话不会删除数据库中保存的记录，您还可以通过“查看全部对话日志”功能查看。<br>确定要清空所有对话吗？', {
        btn: ['确定', '取消'],
        icon: 3,
        title: '确认删除',
        offset: '40%'
    }, function (index) {
        layer.close(index);
        $.ajax({
            url: "deluserconversation.php?type=all&userrndstr=" + userrndstr,
            dataType: "json",
            success: function (data) {
                if (data.success) {
                    refreshhistory();
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

function clearchatpage() {
    $("#ChatPage").html("");
    $("#PromptPage").show();
    $("#ChatPage").hide();
    contextarray = [];
    $("#model option:first").prop("selected", true);
    $("#role option:first").prop("selected", true);
    $("#scene option:first").prop("selected", true);
    $(".divpanel select").css("background", "linear-gradient(to right, #4F80E1 55px, transparent 40px 100%)");
}

function showconversation(id) {
    $.ajax({
        url: "getuserconversation.php?type=single&conversationid=" + id + "&userrndstr=" + userrndstr,
        dataType: "json",
        success: function (data) {
            if (data.success) {
                $("#ChatPage").html("");
                conversationid = id;
                contextarray = [];
                for (var i = 0; i < data.conversation.length; i++) {

                    answer = randomString(16);
                    $("#PromptPage").hide();
                    $("#ChatPage").show();
                    var html = '<div class="dark:border-gray-900 border-b">' +
                        '<div class="flex flex-row py-4 px-4 sm:px-8 font-semibold text-gray-700 dark:text-gray-300 bg-neutral-100 dark:bg-gray-900 items-center" style="padding:10px 20px !important;">' +
                        '<span class="pr-4 grow-0 shrink-0 w-10 sm:w-12">您:</span><span title="双击复制文本" ondblclick="copyToClipboard(this.innerText);layer.msg(\'复制完成！\');" class="grow dark:text-gray-300">' + data.conversation[i].question + '</span>' +
                        '</div></div>' +
                        '<div class="dark:border-gray-900">' +
                        '<div class="px-4 sm:px-8 py-4 flex flex-row text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800" style="padding:10px 20px !important;">' +
                        '<span class="font-semibold pr-4 grow-0 shrink-0 w-10 sm:w-12">AI:</span><span title="双击复制文本" ondblclick="copyToClipboard($(this).clone().find(\'button\').remove().end().text());layer.msg(\'复制完成！\');" class="answer" id="' + answer + '" style="word-break:break-all;"><span class="blink"></span></span>' +
                        '</div></div></div>';

                    $("#ChatPage").append(html);
                    temptext = data.conversation[i].answer;
                    contextarray.push([encodeURIComponent(data.conversation[i].question), encodeURIComponent(data.conversation[i].answer)]);
                    contextarray = contextarray.slice(-5); //只保留最近5次对话作为上下文，以免超过最大tokens限制
                    if (temptext.split("\n").length == 1) {
                        temptext = temptext.replace(/\\n/g, '\n');
                    }
                    temptext = mdHtml.render(temptext);
                    $("#" + answer).html(temptext);
                    //hljs.highlightAll();
                    //if (islastletter) MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
                    $("#" + answer + " pre code").each(function () {
                        $(this).html("<button onclick='copycode(this);' class='codebutton'>复制</button>" + $(this).html());
                    });
                    document.body.scrollTop = document.body.scrollHeight;

                }
                if ($('.card-header').css('top') > '100px') {
                    $('.hide-history').click();
                }
            } else {
                refreshhistory();
            }
        },
        error: function (xhr, status, error) {
            setTimeout(refreshhistory, 1000);
        }
    });
}

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
            location.href = "http://" + window.location.hostname + "/s.php?m=1&s=" + userrndstr;
        } else {
            if ($("#mycontent").html().trim().length == 0) {
                $("#mycontent").html("");
                $("#mycontent").qrcode("http://" + window.location.hostname + "/s.php?s=" + userrndstr);
                checkuserstatus();
            }
            $("#mytitle").html(logintitleleft);
            layerqrcode = layer.open({
                type: 1,
                title: false,
                closeBtn: false,
                area: ['300px', '350px'],
                content: $('#mydialog'),
                shadeClose: true,
            });

        }
    }
}

function showwxlogin() {
    $("#mytitle").html(logintitleleft);
    $("#mycontent").html("");
    $("#mycontent").qrcode("http://" + window.location.hostname + "/s.php?s=" + userrndstr);
}

function showuserlogin() {
    $("#mytitle").html(logintitleright);
    $("#mycontent").html("<iframe style='width:100%;height:100%;' src='userlogin.php?userrndstr=" + userrndstr + "' scrolling='no'></iframe>");
}


function logout() {
    $.cookie('userrndstr', '', {
        expires: 0,
        path: '/'
    });
    location.reload();
}


function copyToClipboard(text) {
    var input = document.createElement('textarea');
    input.innerHTML = text;
    document.body.appendChild(input);
    input.select();
    var result = document.execCommand('copy');
    document.body.removeChild(input);
    return result;
}

function copycode(obj) {
    copyToClipboard($(obj).closest('code').clone().children('button').remove().end().text());
    layer.msg("复制完成！");
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

function send_post() {
    $("#question").val("AI正在思考……");
    $("#question").attr("disabled", true);
    $("#go").text(" 中止 ");
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

    function draw() {
        $.get("getpicture.php?user=" + userrndstr, function (data) {
            layer.close(loading);
            if (data.error) {
                var errcode = data.error.code;
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
                    case null:
                        errmsg = "OpenAI服务器访问超时或未知类型错误";
                        break;
                    default:
                        errmsg = "OpenAI服务器故障，错误类型：" + errcode;
                }
                if ((errcode == "model_not_found") || (errcode == "invalid_user") || (errcode == "out_of_money") || (errcode == "no_valid_apikey") || (errcode == "context_length_exceeded")) {
                    buttongo = true;
                    $("#" + answer).html(errmsg);
                    $("#question").val("");
                    $("#question").attr("disabled", false);
                    $("#go").text(" 发送 ");
                    if (!isMobile()) $("#question").focus();
                } else if (errcode == null) {
                    buttongo = true;
                    $("#" + answer).html(decodeURIComponent(getCookie("errmsg")));
                    $("#question").val("");
                    $("#question").attr("disabled", false);
                    $("#go").text(" 发送 ");
                    if (!isMobile()) $("#question").focus();
                } else {
                    if (retrytimes < 5) {
                        retrytimes++;
                        //layer.msg("出现异常，正在自动重试……");
                        send_post();
                    } else {
                        buttongo = true;
                        $("#" + answer).text(errmsg + "\n错误详情：" + decodeURIComponent(getCookie("errmsg")));
                        $("#question").val("");
                        $("#question").attr("disabled", false);
                        $("#go").text(" 发送 ");
                        if (!isMobile()) $("#question").focus();
                    }
                }
            } else {
                $("#" + answer).html("<img onload='document.body.scrollTop = document.body.scrollHeight;' src='pictureproxy.php?url=" + encodeURIComponent(data.data[0].url) + "'>");
                buttongo = true;
                $("#question").val("");
                $("#question").attr("disabled", false);
                $("#go").text(" 发送 ");
                if (!isMobile()) $("#question").focus();
                refreshquota();
                refreshhistory();
            }
        }, "json");
    }
    function streaming() {
        isstarted = true;
        isalltext = false;
        alltext = "";
        es = new EventSource("stream.php?user=" + userrndstr);
        es.onerror = function (event) {
            layer.close(loading);
            var errcode = getCookie("errcode");
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
                case null:
                    errmsg = "OpenAI服务器访问超时或未知类型错误";
                    break;
                default:
                    errmsg = "OpenAI服务器故障，错误类型：" + errcode;
            }
            es.close();
            if ((errcode == "model_not_found") || (errcode == "invalid_user") || (errcode == "out_of_money") || (errcode == "no_valid_apikey") || (errcode == "context_length_exceeded")) {
                buttongo = true;
                $("#" + answer).html(errmsg);
                $("#question").val("");
                $("#question").attr("disabled", false);
                $("#go").text(" 发送 ");
                if (!isMobile()) $("#question").focus();
            } else if (errcode == null) {
                buttongo = true;
                $("#" + answer).html(decodeURIComponent(getCookie("errmsg")));
                $("#question").val("");
                $("#question").attr("disabled", false);
                $("#go").text(" 发送 ");
                if (!isMobile()) $("#question").focus();
            } else {
                if (retrytimes < 5) {
                    retrytimes++;
                    //layer.msg("出现异常，正在自动重试……");
                    send_post();
                } else {
                    buttongo = true;
                    $("#" + answer).text(errmsg + "\n错误详情：" + decodeURIComponent(getCookie("errmsg")));
                    $("#question").val("");
                    $("#question").attr("disabled", false);
                    $("#go").text(" 发送 ");
                    if (!isMobile()) $("#question").focus();
                }
            }
            return;
        }
        es.onmessage = function (event) {
            if (isstarted) {
                previousScrollPosition = document.body.scrollTop;
                userScrolling = false;
                isstarted = false;
                layer.close(loading);
                let str_ = '';
                let i = 0;
                strforcode = '';
                timewait = 30;
                timer = setInterval(() => {
                    if (previousScrollPosition > document.body.scrollTop) {
                        userScrolling = true;
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
                            timewait = 30;
                        }
                        if ((newalltext.length - 3 - str_.length) > 20) {
                            timewait = 20;
                        }
                        if ((newalltext.length - 3 - str_.length) > 30) {
                            timewait = 10;
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
                                    success: function (data) {
                                        layer.close(loading);
                                        if (!data.isvalid) {
                                            strforcode = "AI的回答未通过内容审核！";
                                            renderhtml(strforcode);
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
                            if (contextarray.length == 1) refreshhistory();
                        }
                    }

                    renderhtml(strforcode);
                }, timewait);
            }
            if (event.data == "[DONE]") {
                isalltext = true;
                contextarray.push([encodeURIComponent(prompt), encodeURIComponent(alltext)]);
                contextarray = contextarray.slice(-5); //只保留最近5次对话作为上下文，以免超过最大tokens限制
                es.close();
                return;
            }
            var json = eval("(" + event.data + ")");
            if (json.choices[0].delta.hasOwnProperty("content")) {
                if (alltext == "") {
                    alltext = json.choices[0].delta.content.replace(/^\n+/, '');
                } else {
                    alltext += json.choices[0].delta.content;
                }
            }
        }
    }

    if (contextarray.length == 0) {
        conversationid = Date.now();
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
                if ($("#model option:selected").text().indexOf("画") >= 0) {
                    draw();
                } else {
                    streaming();
                }
            } else {
                layer.msg(data.message);
            }
        }
    });


}

function renderhtml(strforcode) {
    newalltext = mdHtml.render(strforcode);
    $("#" + answer).html(newalltext);
    //hljs.highlightAll();
    //if (islastletter) MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
    $("#" + answer + " pre code").each(function () {
        $(this).html("<button onclick='copycode(this);' class='codebutton'>复制</button>" + $(this).html());
    });

    //var converter = new showdown.Converter();
    //$("#" + answer).html(converter.makeHtml(strforcode));
    if (!userScrolling) {
        if (previousScrollHeight !== document.body.scrollHeight) {
            document.body.scrollTop = document.body.scrollHeight;
            previousScrollPosition = document.body.scrollTop;
            previousScrollHeight = document.body.scrollHeight;
        }
    }
}

function gogogo() {
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
    if (!buttongo) {
        if ($("#model option:selected").text().indexOf("画") < 0) {
            clearInterval(timer);
            buttongo = true;
            if (!isalltext) {
                contextarray.push([encodeURIComponent(prompt), encodeURIComponent(alltext)]);
                contextarray = contextarray.slice(-5);
                es.close();
            }
            $("#question").val("");
            $("#question").attr("disabled", false);
            $("#go").text(" 发送 ");
            if (!isMobile()) $("#question").focus();
            refreshquota();
            if (contextarray.length == 1) refreshhistory();
        }
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
                            prompt = decodeURIComponent(data.newtext);
                            preparetoask();
                        }
                    }
                });
            } else {
                preparetoask();
            }
        }

    }
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
            success: function (data) {
                layer.close(loading);
                if (!data.isvalid) {
                    layer.msg("您录入的问题未通过内容审核！");
                    return;
                } else {
                    starttoask();
                }
            }
        });
    } else {
        starttoask();
    }
}

function starttoask() {
    buttongo = false;
    answer = randomString(16);
    $("#PromptPage").hide();
    $("#ChatPage").show();
    var html = '<div class="dark:border-gray-900 border-b">' +
        '<div class="flex flex-row py-4 px-4 sm:px-8 font-semibold text-gray-700 dark:text-gray-300 bg-neutral-100 dark:bg-gray-900 items-center" style="padding:10px 20px !important;">' +
        '<span class="pr-4 grow-0 shrink-0 w-10 sm:w-12">您:</span><span title="双击复制文本" ondblclick="copyToClipboard(this.innerText);layer.msg(\'复制完成！\');" class="grow dark:text-gray-300" id="q' + answer + '" style="word-break:break-all;"></span>' +
        '</div></div>' +
        '<div class="dark:border-gray-900">' +
        '<div class="px-4 sm:px-8 py-4 flex flex-row text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800" style="padding:10px 20px !important;">' +
        '<span class="font-semibold pr-4 grow-0 shrink-0 w-10 sm:w-12">AI:</span><span title="双击复制文本" ondblclick="copyToClipboard($(this).clone().find(\'button\').remove().end().text());layer.msg(\'复制完成！\');" class="answer" id="' + answer + '" style="word-break:break-all;"><span class="blink"></span></span>' +
        '</div></div></div>';

    $("#ChatPage").append(html);
    for (var j = 0; j < prompt.length; j++) {
        $("#q" + answer).text($("#q" + answer).text() + prompt[j]);
    }
    retrytimes = 0;

    send_post();
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


$(".divpanel select").on({
    focus: function () {
        $(this).css("background", "#4F80E1");
    },
    blur: function () {
        if ($(this).find('option:first').is(':selected')) {
            $(this).css("background", "linear-gradient(to right, #4F80E1 55px, transparent 40px 100%)");
        }
    },
    change: function () {
        if ($(this).find('option:first').is(':selected')) {
            $(this).css("background", "linear-gradient(to right, #4F80E1 55px, transparent 40px 100%)");
        }
    }
});

$(document).on('click', '.product', function () {
    $(this).addClass("selected").siblings().removeClass("selected");
    $("#productid").val($(this).attr("productid"));
});
var currentTime = new Date();

function showwxpayqrcode() {
    var productid = $('#productid').val();
    if (productid == "") {
        layer.msg("请选择充值卡类型");
        return false;
    }
    layer.close(buylayer);
    var isWechat = /MicroMessenger/i.test(navigator.userAgent);
    if (isWechat) {
        location.href = "http://" + window.location.hostname + "/wxpay.php?m=1&p=" + productid + "&s=" + userrndstr;
    } else {
        $("#mycontent").html("");
        $("#mycontent").qrcode("http://" + window.location.hostname + "/wxpay.php?p=" + productid + "&s=" + userrndstr);

        $("#mytitle").html("请用微信扫码支付");
        layerqrcode = layer.open({
            type: 1,
            title: false,
            closeBtn: false,
            area: ['300px', '350px'],
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


function showrechargecard() {
    $("#buypanel").html('<div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height:100%;"><input type="text" id="cardpass" placeholder="充值卡密码" maxlength="20" style="width: 80%; padding: 10px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 5px; font-size: 16px;" oninput="this.value=this.value.replace(/\\\\s+/g,\\\'\\\')"><button onclick="rechargebycard();" style="background-color: #007bff; color: #fff; border: none; padding: 10px 20px; margin:20px; font-size: 16px; cursor: pointer;">充值</button></div>');
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
        url: "checkwxpaystatus.php?userrndstr=" + userrndstr + "&begintime=" + currentTime,
        dataType: "json",
        success: function (data) {
            if (data.success) {
                if (typeof layerqrcode !== "undefined") layer.close(layerqrcode);
                refreshquota();
            } else {
                if ($("#qrcode-container2").is(":visible")) {
                    setTimeout(checkwxpaystatus, 1000);
                }
            }
        },
        error: function (xhr, status, error) {
            setTimeout(checkwxpaystatus, 1000);
        }
    });
}
