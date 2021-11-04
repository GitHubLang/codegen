@@///这是一个生成form表单的标签
@@///参数1： stageCode，流程步骤代码
@@///调用方法为  <#formFlow1 stageCode='${data.stageCode}' />
@@////////////////////////////////////////下方为传入参数//////////////////
@@
@@
@@////////////////////////////////////////////////////////////////////////
@@var dr = '$';

@if(${stageCode} == nextStage){
<div id="stage${stageCode}">
    <div class="layui-fluid" style="padding-bottom: 18px;padding-top: 0px;">
        <div class="layui-card">
            <div class="layui-card-body">
                <div style="padding-top: 10px">

                    <div>
                        <div class="bigTitle" style="margin-top: 15px">${title!'标题'+stageCode}</div>
                        <div class="row countryList">
                            <div style="padding: 0 15px;margin: 5px 0px 0px 0px;">
<%
    if(isNotEmpty(mydata)){
        for(data in mydata){

%>
@@////////////////////////写模板区域//////////////////////////
@@//↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓data为数据表格每行的数据↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
    @@ if(data.stageCode==stageCode){
        <#formType1 index='${dataLP.dataIndex}' />
    @@}
@@//↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑写模板区域↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
<%
        }
    }
%>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </div>
</div>
<div id="submit" class="form-group-bottom text-center" style="margin-top: 50px;margin-bottom: 50px;" >
    <button class="layui-btn kens-button-submit" lay-submit lay-filter="btnSubmit">&emsp;提交&emsp;</button>
</div>
@}else if((${stageCode}< nextStage)){

@}