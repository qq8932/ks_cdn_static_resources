<!-- ks1_vl start -->

<iframe style="display:none;" id="ks1_vl_ws" name="ks1_vl_ws"></iframe>

<script>
jQuery(document).ready(function(){
    try{
        setTimeout(function(){
            var interval = setInterval(function(){

                var divElement = document.querySelector('.button_icon-button-text');
                if(divElement){
                    clearInterval(interval);
                    fn_ks1_add_menu();
                }
            }, 50);
        }, 50); 

    }catch(error){
        console.log('ks1_vl init error')
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
      window.open("./ks1_vl/login.php?rndstr="+userrndstr+"&ref");
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
    textDiv.innerHTML = "虚拟恋人";
    newButton.appendChild(iconDiv);
    newButton.appendChild(textDiv);

    // 将button添加到新的div中
    newDiv.appendChild(newButton);

    // 将新的div添加到原始div的后面
    var originalDiv = document.querySelector(".home_sidebar-header-bar");
    originalDiv.parentNode.insertBefore(newDiv, originalDiv.nextSibling);

}

</script>
<!-- ks1_vl end -->