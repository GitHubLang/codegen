@@///这是一个测试标签
@@///调用方法为  <#html:input  index='0' />

@@var index = parseInt(index);
@@var data = mydata[index];
<input  id="${data.column}" name="${data.column}" type="text" lay-verify="required"
       class="layui-input baseInfo" autocomplete="off" />