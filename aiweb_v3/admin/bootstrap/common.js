var editId=""; 
var delId=""	

function editItem(chkName){
	var ele=document.getElementsByName(chkName);
	var count=0;
	var val="";
	for(var i=0;i<ele.length;i++){
		var temp=ele[i];
		if(temp.type=="checkbox" && temp.checked){
			val=temp.value;
			count++;
		}
	}
	if(count!=1){
		alert("请只选择一条要编辑的记录！");
		return false;
	}
	
	return val;
}

function deleteItem(chkName){
	var ele=document.getElementsByName(chkName);
	var count=0;
	var val="";
	for(var i=0;i<ele.length;i++){
		var temp=ele[i];
		if(temp.type=="checkbox" && temp.checked){
			count++;
			val=val+","+temp.value;
		}
	}
	if(count==0){
		alert("请选择要删除的记录（可多选）！");
		return false;
	}
	if(!confirm("确定要删除选择的记录？")) return false;
	val=val.substring(1);
	return val;
}
function selectItem(chkName){
	var ele=document.getElementsByName(chkName);
	var count=0;
	var val="";
	for(var i=0;i<ele.length;i++){
		var temp=ele[i];
		if(temp.type=="checkbox" && temp.checked){
			count++;
			val=val+","+temp.value;
		}
	}
	if(count==0){
		alert("请选择要操作的记录（可多选）！");
		return false;
	}
	if(!confirm("确定要操作所选择的记录？")) return false;
	val=val.substring(1);
	return val;
}
function selectOptionsChange( selNameFrom,selNameTo,formName){
var form = document.forms[0];
if (formName!=null){
	form = document.forms[formName];
}
var sel1 = form.all(selNameFrom,0);
var sel2 = form.all(selNameTo,0);
	for (var j=0;j<sel1.options.length ; j++){
		if (sel1.options[j].selected == true){
			var opt = sel1.options[j];
			sel1.options[j] = null;
			sel2.options[sel2.options.length] = opt;
			if (j==0&&sel1.options[j]!=null&&sel1.options[j].selected == true&&sel1.multiple!=true) break;
			j=j-1;
		}
	}
}

String.prototype.trim = function(){
	return this.replace(/(^\s*)|(\s*$)/g, "");
}
String.prototype.isBlank=function(){
	if(this.trim().length==0) return true;
	return false;
}
function dialogWindow(url,w,h,title,roll){
	var width = 600;
	var height = 400;
	if(w != null)
		width = w;
	if(h != null)
		height = h;
	var fileUrl='/moni/js/frame.jsp?title='+title;
	if(roll!=null){
		fileUrl = fileUrl+'&roll=yes'
	}
	return window.showModalDialog(fileUrl, [window,url,title], "resizable:yes;status:no;dialogHeight:"+height+"px;dialogWidth:"+width+"px;");
}

function isNull( str ){
	if ( str == "" ) return true;
	var regu = "^[ ]+$";
	var re = new RegExp(regu);
	return re.test(str);
}
function getMaxDay(year,month) {
    if(month==4||month==6||month==9||month==11)
        return "30";
    if(month==2)
        if(year%4==0&&year%100!=0 || year%400==0)
            return "29";
        else
            return "28";
    return "31";
}
function isNumber( str ){  
    var regu = /^(\d+)$/;
        return regu.test(str);
}
function isDate(date) { 

   var year = date.substring(0,4);
   var month = date.substring(4,6);
   var day = date.substring(6,8);
   var hour = date.substring(8,10);
   var mi = date.substring(10,12);
   if(!isNumber(year)||year>"2100" || year< "1900") return false;
   else if(!isNumber(month)||month>"12" || month< "01") return false;
   else if(day>getMaxDay(year,month) || day< "01") return false;
   else if(!isNumber(hour)||hour>"23"||hour<"00") return false;
   else if(!isNumber(mi)||mi>"59"||mi<"00") return false;
   else return true;
} 
function isDate1(date) { 
   var year = date.substring(0,4);
   var month = date.substring(4,6);
   var day = date.substring(6,8);
   if(!isNumber(year)||year>"2100" || year< "1900") return false;
   else if(!isNumber(month)||month>"12" || month< "01") return false;
   else if(day>getMaxDay(year,month) || day< "01") return false;
   else return true;
} 
function getSelectedValues( selName,formName){
	var form = document.forms[0];
	if (formName!=null){
		form = document.forms[formName];
	}
	var valueArray = new Array();
	var sel = form.all(selName,0);
	var cnt =0;
        for (var j=0;j<sel.options.length ; j++){
			if (sel.options[j].selected == true){
				valueArray[cnt] = sel.options[j].value;
				cnt++;
			}
	}
	if(sel.multiple!=true) return valueArray[0];
	return valueArray;
}
	
function getFormQueryString(formID)
{ 
       var i,queryString = "", and = "";
       var items = document.forms[formID].elements;
       var itemValue;
       for( i=0;i<items.length;i++ )
       {
              var item = items[i];
              if ( item.name!='' ) 
              {
                     if ( item.type == 'select-one' ) 
                     {
                            itemValue = item.options[item.selectedIndex].value;
                     }
					 else if(item.type == 'select-multiple')
					 {
							for(var j =0;j<item.length;j++)
							{
									itemValue = item.options[j].value;
									itemValue = escape(itemValue);
									queryString += and + item.name + '=' + itemValue;
									and="&";
							}
							continue;
					 }
                     else if ( item.type=='checkbox' || item.type=='radio') 
                     {
                            if ( item.checked == false )
                            {
                                   continue;    
                            }
                            itemValue = item.value;
                     }
					else if ( item.type == 'button' || item.type == 'submit' || item.type == 'reset' || item.type == 'image')
                     {
                            continue;
                     }
                     else 
                     {
                            itemValue = toDBC(item.value);
                     }
                     itemValue = encodeURIComponent(itemValue);
                     queryString += and + item.name + '=' + itemValue;
                     and="&";
              }
       }
       return queryString;
}

function toDBC(str)
{
	var result="";
	for (var i = 0; i < str.length; i++)
	{
		if (str.charCodeAt(i)==12288)
		{
			result+= String.fromCharCode(str.charCodeAt(i)-12256);
			continue;
		}
		else if (str.charCodeAt(i)>65280 && str.charCodeAt(i)<65375)
		{
			result+= String.fromCharCode(str.charCodeAt(i)-65248);
		}
		else result+= String.fromCharCode(str.charCodeAt(i));
	}
	return result.trim();
}

//全选、以及全否事件
function changeAll(obj,checkName){
	var status = obj.checked;
	var checkboxs = document.getElementsByName(checkName);
     for(var i=0,len=checkboxs.length;i<len;i++){
      	var item = checkboxs[i];
      	item.checked = status;
      }
}


//所有分页的跳转和搜索条件的点击
function go(currentPage){
	$("#currentPage").val(currentPage);
	var loginUserId=$("#loginUserId").val();
	$("#formLoginUserId").val(loginUserId);
	$("#form0").submit();
} 
function gotos(totalPage){
	var str = $("#cpage").val();
		if(!isNumber(str) || parseInt(str) > parseInt(totalPage) || str < 1){
			alert('请输入正确的页数');
		}else{
			go(str);
		}
}

$(document).ready(function(){ 
    $("#searchName").keydown(function(e){
        var curKey = e.which || e.keyCode; 
        if(curKey == 13){ 
            go('1');
        } 
    }); 
});

