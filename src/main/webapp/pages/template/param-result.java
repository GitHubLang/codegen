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
    private ${data.jtype} ${data.column};

@@//↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑写模板区域↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
<%
}
}
%>