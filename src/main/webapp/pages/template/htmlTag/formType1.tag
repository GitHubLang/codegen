@@///这是一个生成form表单的标签
@@///参数1： index，表示取mydata的第i个元素
@@///调用方法为  <#formType1 index='${dataLP.dataIndex}' />
@@////////////////////////////////////////下方为传入参数//////////////////
@@ var index = parseInt(index);
@@ var data = mydata[index];
@@////////////////////////////////////////////////////////////////////////
@@var at = '@';
@@var dr = '$';
@@ var formType = data.genType;
@@ switch(formType){
        @@ case 'input':

                <div class="layui-inline  layui-col-xs${data.genlength} layui-col-md${data.genlength}">
                    <label class="layui-form-label"><span>*</span>${data.comments}</label>
                    <div class="layui-input-block">
                        <input id="${data.column}" name="${data.column}" type="text" lay-verify="required"
                               class="layui-input baseInfo" autocomplete="off" />
                    </div>
                </div>

        @@break;

        @@case 'select':
                <div class="layui-inline layui-col-xs${data.genlength} layui-col-md${data.genlength}" >
                    <label class="layui-form-label" ><span>*</span>${data.comments}</label>
                    <div class="layui-input-block">
                        <select name="${data.column}" id="${data.column}" lay-filter="${data.column}" lay-verify="required"
                                class="layui-input baseInfo">
                            <option value="" selected>-请选择-</option>
                            @if(intermediary != null){
                            @for(state in intermediary){
                            <option value="${dr}{state.code}">${dr}{state.name}</option>
                            @}
                            @}
                        </select>
                    </div>
                </div>

        @@break;

        @@case 'file':
                <div class="layui-inline  layui-col-xs12 layui-col-md12">
                    <label class="layui-form-label attachment-label"><span>*</span>${data.comments}</label>
                    <div class="layui-input-block">
                        <div class="layui-inline  layui-col-xs12 layui-col-md12 multi-file-div lastrow">
                        </div>
                        <button class="layui-btn btn-upload btn-multi-upload" id="${data.column}">添加附件</button>
                    </div>
                </div>

        @@break;

        @@case 'radio':
                <div class="layui-inline layui-col-xs${data.genlength} layui-col-md${data.genlength}" >
                    <label class="layui-form-label" ><span>*</span>${data.comments}</label>
                    <div class="layui-input-block">
                        <input type="radio" name="${data.column}" lay-filter="${data.column}" value="1" title="通过" />
                        <input type="radio" name="${data.column}" lay-filter="${data.column}" value="3" title="退回" />
                    </div>
                </div>

        @@break;

        @@case 'textarea':
                <div class="layui-inline  layui-col-xs12 layui-col-md12">
                    <label class="layui-form-label text-area">${data.comments}</label>
                    <div class="layui-input-block">
                        <textarea name="${data.column}" id="${data.column}" placeholder="" class="layui-textarea"></textarea>
                    </div>
                </div>

        @@break;

        @@default:
        @@print("error");

@@   }
