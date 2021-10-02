
layui.config({
    base: '/assets/' //假设这是你存放拓展模块的根目录
}).extend({ //设定模块别名

});

layui.use(['element','table','form','layer', 'util','formTools'], function(){
    var element = layui.element
        ,layer = layui.layer
        ,util = layui.util
        ,table = layui.table
        ,form = layui.form
        ,formTools = layui.formTools
        ,model = formTools.model
        ,$ = layui.$;
    var wCount = 1;

    var table1 = {
        tableId: "table1"    //表格id
    };
    /**
     * 初始化表格的列
     */
    table1.initColumn = function () {
        return [[

            {type: 'checkbox'},
            {type: 'radio',field: 'moveRadio',title:'移动'},
             {type: 'numbers',field: 'orderNum',title:'序号'},

            {field: 'fieldName',  sort: true, title: '列名'},
            {field: 'isnull',  hide: true, title: '为空'},
            {field: 'comments', align: "center", title: '备注' , templet:function (d) {
                if(formTools.isEmpty(d.comments)) d.comments = '';
                    var html = //' <div class="layui-input-block">\n' +
                        '   <input  type="text" name="'+ d.column + '_comments' + '" value="'+ d.comments +'"  autocomplete="off" class="layui-input value-input">\n' ;
                    // '   </div>';

                    return html;
                }},
            {field: 'ctype', align: "center", title: '字段类型' , sort: true},
            {field: 'genType', align: "center", title: '生成类型' , templet:function (d) {
                var html = '<div class="layui-inline" >\n' +
                    '       <div class="layui-input-inline">\n' +
                    '           <select id = "'+ d.column + '_genType'+'" name="'+ d.column + '_genType'+'"  lay-filter="'+ d.column + '_genType'+'" lay-search="">\n' +
                    '               <option value="input" selected>input</option>\n' +
                    '               <option value="select">select</option>\n' +
                    '               <option value="textarea">textarea</option>\n' +
                    '               <option value="radio">radio</option>\n' +
                   // '               <option value="checkbox">checkbox</option>\n' +
                    '               <option value="file">file</option>\n' +
                    '           </select>\n' +
                    '       </div>\n' +
                    '   </div>';

                return html;

                }},
            {field: 'genlength', align: "center", title: '长度' , templet:function (d) {
                  var html = //' <div class="layui-input-block">\n' +
                      '   <input  type="text" name="'+ d.column + '_genlength' + '" value="6"  autocomplete="off" class="layui-input cfg-input">\n' ;
                     // '   </div>';

                  return html;
                }}
        ]];
    };
    var cfgArr = ['comments','genType','genlength'];
    var addField = ['entity','result','mapper'];


    //数据库表
    formTools.setSelectFromUrl('dbtables', '/allTables', {},{
        keyName: 'name',
        valueName: 'comments'
    },function (res) {
        return  res.data;
    });

    //模板文件

    var templateSelect = xmSelect.render({
        el: '#tmpName',
        filterable: true,
        tips: '请选择模板文件',
        delay:100,
        prop:{
            name:'fileName',
            value:'fileName'
        },
        toolbar: {
            show: true,
        },
        data: []
    });

    $.post('/allTemplates',{},function (res) {
        var data = res.data;
        templateSelect.update({data:data});
    },'json');



    // 数据库表事件, 渲染表格
    form.on('select(dbtables)',function (data) {
        var value = data.value;
        // 渲染表格
        var tableResult = table.render({
            elem: '#' + table1.tableId,
            url: '/tables/' + value,
            page: true,
            height: "full-200",
            cellMinWidth: 100,
            cols: table1.initColumn()
        });
    });


    var tableResult = table.render({
        elem: '#' + table1.tableId,
        url: '/tables/' + " ",
        page: true,
        height: "full-200",
        cols: table1.initColumn()
    });

    //编辑列名
    table.on('edit('+table1.tableId+')', function(obj){
        var value = obj.value //得到修改后的值
            ,data = obj.data //得到所在行所有键值
            ,field = obj.field; //得到字段
            data[field] = value;
    });



    //生成按钮
    $('#btnGen').click(function (e) {
        var checkRows = table.checkStatus(table1.tableId);
        getConfigValue(checkRows.data);
       // console.log(checkRows.data);
        var htmlStr = genHtmlTemplate(checkRows.data);
        var entityJson = genAddField(checkRows.data);
        var addFieldHtml = '';
        for(var key in entityJson){
            addFieldHtml+=getCodeHtml(key,key,'java' ,entityJson[key]);
        }

        addToWindow("代码"+wCount,
            ''
            + addFieldHtml
            + getCodeHtml('html','ihtml','html' ,htmlStr)
            ,''
            );

    });

    //测试按钮
    $('#btnTest').click(function (e) {
        var checkRows = table.checkStatus(table1.tableId);
        getConfigValue(checkRows.data);
       // console.log(checkRows.data);

        var tval =  templateSelect.getValue('valueStr');


        if(formTools.isEmpty(tval)){
            templateSelect.warning();
            layer.msg("请选择模板文件");
            return false;
        }


         $.post('/setData',{'data':JSON.stringify(checkRows.data),'templateStr':tval},function (res) {
           // console.log(res);
             res = res.data;
             var showHtml = '';
             var anchorStart = '<div class="an-fixed"><ul>';
             var anchorEnd = '</ul></div>';
             var anchorMiddle ='';

             for (let i = 0; i <res.length ; i++) {
                 var fileName = res[i]['tempFileName'];
                 var tFileName = res[i]['tempFileName'].split(".");
                 var fileNamePre = tFileName[0];
                 var language = tFileName[1];
                 var resStr = res[i]['tempRes'];
                 anchorMiddle += getAnchorHtml( fileNamePre+'/'+language, 'i'+fileNamePre+language + wCount);
                 showHtml += getCodeHtml(fileNamePre+'/'+language ,'i'+fileNamePre+language+wCount ,language ,resStr);

             }


             addToWindow("代码"+wCount,
                 ''
                 + showHtml
                 , anchorStart+anchorMiddle+anchorEnd
             );

         },'json');

    });

    //获取配置信息
  function getConfigValue(data){
      if(formTools.isEmpty(data)) {return data;}

      for (var i = 0; i < data.length; i++) {
          for (var j = 0; j < cfgArr.length; j++) {
              var name = data[i]['fieldName']+'_'+cfgArr[j];
              data[i][name] = $('[name='+name+']').val();
              data[i][cfgArr[j]] = $('[name='+name+']').val();
              data[i]['jtype'] =getJavaType(data[i]['ctype']);


              if( data[i]['column'].indexOf('_')>=0){
                  data[i]['column'] = formTools.toHump(data[i]['column'].toLowerCase());
              }
              data[i]['upperCamel'] = data[i]['column'][0].toUpperCase() + data[i]['column'].substring(1);

          }
      }
  }

  function getJavaType(dbType){

        if(formTools.isEmpty(dbType)) {return 'String';}
        var dbtype = dbType.toLowerCase();

        if(dbtype.indexOf('varchar')>=0){
            return 'String';
        }else if(dbtype.indexOf('number()')>=0){
            return 'BigDecimal';
        }else if(dbtype.indexOf('number')>=0){
            return 'Long';
        }else if(dbtype.indexOf('int')>=0){
            return 'Integer';
        } else if(dbtype.indexOf('date')>=0){
            return 'Date';
        }else {
            return 'String';
        }
    }

    //模板文件替换
  function genHtmlTemplate(data){
      if(formTools.isEmpty(data)) return data;
        var resHtml = '';
      for (var i = 0; i < data.length; i++) {
          console.log(i, data[i]['fieldName']);

              var genType = data[i]['fieldName']+'_'+'genType';
              var mdStr = model[data[i][genType]];
              var rstart = '\\${';
              var rend = '}';

              for(var key in data[i]){
                   // console.log(key, data[i][key]);
                  var reg = new RegExp(rstart + key + rend,"gm");


                      mdStr = mdStr.replace(reg, data[i][key]);


              }
          //console.log(mdStr);
          resHtml += mdStr+'\n\n';
      }
     // console.log(resHtml);

      //console.log( getCodeType('html' ,resHtml));
     return resHtml;
  }

  function genAddField(data) {

      var resData = {};
      for (var i = 0; i < addField.length; i++) {
          var resHtml = '';
          var mdStr = model[addField[i]];
          for (var j = 0; j <data.length ; j++) {
              resHtml += getModelRes(mdStr, data[j])+'\n\n';
          }
          resData[addField[i]] = resHtml;

      }

      return resData;
  }

  function getModelRes(mdStr, data) {

      if(formTools.isEmpty(data)) return data;
      var rstart = '\\${';
      var rend = '}';

      for(var key in data){
          // console.log(key, data[i][key]);
          var reg = new RegExp(rstart + key + rend,"gm");


              mdStr = mdStr.replace(reg, data[key]);

      }
      return mdStr;

  }




    function getCodeHtml(title, id, language, content) {
      if(formTools.isEmpty(language)) language = 'plaintext';



        var titleHtml = '<p class="p-title" id="p-'+id+'">' + title + '：</p>';
        var copyHtml = '<div class="copy-button" data-clipboard-action="copy" data-clipboard-target="#'+ id +'">复制</div>';
        var prevStart = '<pre id="'+ 'p' + id +'">'+ copyHtml +'<code id="' + id +'" class="language-' + language + '">';



        var prevEnd = '</code></pre>';
        content = content.replace(/</gm, '&lt;');
        content = content.replace(/>/gm, '&gt;');
        return  titleHtml + prevStart + content + prevEnd;
    }



   function getAnchorHtml(title, id){
      return '<li><a href="#p-'+id+'">'+title+'</a></li>';
    }

    function addToWindow(title, content, anchor) {
      wCount++;
        //多窗口模式，层叠置顶
        layer.open({
            type: 1 //此处以iframe举例
            ,
            title: title
            ,
            area: ['1100px', '641px']
            ,

            shade: 0
            ,
            maxmin: true
            ,
            content: content
            ,
            zIndex: layer.zIndex //重点1
            ,
            success: function (layero, index) {
                layer.setTop(layero); //重点2. 保持选中窗口置顶

              $(layero).find('.layui-layer-title').eq(0).after(anchor);

                //记录索引，以便按 esc 键关闭。事件见代码最末尾处。
                layer.escIndex = layer.escIndex || [];
                layer.escIndex.unshift(index);
                //选中当前层时，将当前层索引放置在首位
                layero.on('mousedown', function () {
                    var _index = layer.escIndex.indexOf(index);
                    if (_index !== -1) {
                        layer.escIndex.splice(_index, 1); //删除原有索引
                    }
                    layer.escIndex.unshift(index); //将索引插入到数组首位
                });
                hljs.highlightAll();
            }
            ,
            cancel: function(index, layero){

                layer.close(index);
                return false;
            }
            ,
            end: function () {
                wCount--;
                //更新索引
                if (typeof layer.escIndex === 'object') {
                    layer.escIndex.splice(0, 1);
                }
            }
        });
    }


    //头部事件
    util.event('lay-header-event', {
        //左侧菜单事件
        menuLeft: function(othis){
            layer.msg('展开左侧菜单的操作', {icon: 0});
                console.log(1)
        }
        ,menuRight: function(){
            layer.open({
                type: 1
                ,content: '<div style="padding: 15px;">处理右侧面板的操作</div>'
                ,area: ['260px', '100%']
                ,offset: 'rt' //右上角
                ,anim: 5
                ,shadeClose: true
            });
        }
    });

});