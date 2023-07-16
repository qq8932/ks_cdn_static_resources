<!-- ks1_distributor start -->

<iframe style="display:none;" id="ks1_distributor_ws" name="ks1_distributor_ws"></iframe>

<script>
jQuery(document).ready(function(){
    try{
        let referral_code='';

<?php
/* 

作者:qq492607291,   大叔编码不容易，请勿盗版或抄袭! [抱拳][抱拳][抱拳] 

此代码介绍：     【众筹ks1-003】分销功能  
    http://bbs.ipfei.com/forum.php?mod=viewthread&tid=55&fromuid=228
    (出处: ChatGPT商业版内部社区)

User ID:85968dd798a9c7105b5220fd4bb4b92a, Generated at:2023-06-17 09:13:30
*/

if (isset($_GET["referral_code"]) ) {
    if(!isset($_COOKIE['referral_code'])){
        $referral_code=$_GET["referral_code"];
        echo '      referral_code="'.$referral_code.'";';
    }
}
?>
        $('#ks1_distributor_ws').attr('src',"ks1_distributor/login.php?userrndstr="+userrndstr+"&referral_code="+referral_code);

        setTimeout(function(){
            var interval = setInterval(function(){

            var divElement = document.querySelector('.button_icon-button-text');
            //var ks1menu='<span style="margin:0 10px;"><a href="./ks1_distributor/login.php?rndstr='+userrndstr+'"&ref">分销商系统</a></span>';
            //var ks1menu='<span style="margin:0 10px;"><a href="./ks1_distributor/login.php?rndstr='+userrndstr+'"&ref">分销商系统</a></span>';
            

                if(divElement){
                    clearInterval(interval);
                    //divElement.insertAdjacentText('afterend', ks1menu);
                    //divElement.insertAdjacentHTML('afterend', ks1menu);
                    fn_ks1_add_menu();

                }
            }, 50);
        }, 50); 

    }catch(error){
        console.log('ks1_distributor init error')
        console.error(error);
    }
    
});

function fn_ks1_add_menu(){
 
     // 创建新的div元素
    var newDiv = document.createElement("div");
    newDiv.className = "home_sidebar-header-bar";

    // 创建新的button元素
    var newButton = document.createElement("button");
    newButton.className = "button_icon-button button_shadow home_sidebar-bar-button clickable";
    newButton.onclick = function() {
      window.open("./ks1_distributor/login.php?rndstr="+userrndstr+"&ref");
    };

    // 创建button内部的元素
    var iconDiv = document.createElement("div");
    iconDiv.className = "button_icon-button-icon";
    var icon = document.createElement("i");
    icon.className = "layui-icon";
    icon.innerHTML = "";
    iconDiv.appendChild(icon);

    var textDiv = document.createElement("div");
    textDiv.className = "button_icon-button-text";
    textDiv.innerHTML = "推介系统";
    newButton.appendChild(iconDiv);
    newButton.appendChild(textDiv);

    // 将button添加到新的div中
    newDiv.appendChild(newButton);

    // 将新的div添加到原始div的后面
    var originalDiv = document.querySelector(".home_sidebar-header-bar");
    originalDiv.parentNode.insertBefore(newDiv, originalDiv.nextSibling);

/*
    var newButton = document.createElement("button");
    newButton.onclick = function() {
      window.open("./ks1_distributor/login.php?rndstr="+userrndstr+"&ref");
    };

    var newDiv = document.createElement("div");
    newDiv.className = "button_icon-button button_shadow home_sidebar-bar-button clickable";

    var newIcon = document.createElement("i");
    newIcon.className = "layui-icon";
    newIcon.innerHTML = "";

    var newTextDiv = document.createElement("div");
    newTextDiv.className = "button_icon-button-text";
    newTextDiv.innerHTML = "推介系统";

    newDiv.appendChild(newIcon);
    newButton.appendChild(newDiv);
    newButton.appendChild(newTextDiv);

    var parentDiv = document.querySelector(".home_sidebar-header-bar");
    parentDiv.insertBefore(newButton, parentDiv.children[1]);
*/
}

</script>
<!-- ks1_distributor end -->