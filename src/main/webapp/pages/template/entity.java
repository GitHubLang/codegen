<%
        var at = '@';
        var dr = '$';

        if(isNotEmpty(mydata)){
        for(data in mydata){

%>
@@////////////////////////写模板区域//////////////////////////
@@//↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓data为数据表格每行的数据↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
    /**
     * ${data.comments}
     */
     @TableField("${data.fieldName}")
     private ${data.jtype} ${data.column};

@@//↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑写模板区域↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
<%
}
}
%>


<%
if(isNotEmpty(mydata)){
for(data in mydata){
%>
@@////////////////////////写模板区域//////////////////////////
@@//↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓data为数据表格每行的数据↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓

     public ${data.jtype} get${data.upperCamel}(){
          return ${data.column};
     }

     public void set${data.upperCamel}(${data.jtype+' '+data.column}){
         this.${data.column} = ${data.column};
     }

@@//↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑写模板区域↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
<%
}
}
%>