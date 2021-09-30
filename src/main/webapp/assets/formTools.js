layui.define(['form', 'laydate',  'upload', 'jquery', 'layer', 'table'], function (exports) {
    var $ = layui.jquery;
    var form = layui.form;
    var laydate = layui.laydate;
    var upload = layui.upload;
    var layer = layui.layer;
    var table = layui.table;

    var formTools = {
        //文件上传地址
        uploadURL: '#',
        deleteBtn: true,
        uploadListIns: '',
        formReplaceExcept: [],
        //动态表格
        dyTable: {},
        //表单验证表达式
        verify: {
            phone: [/(^$)|^1\d{10}$/, "请输入正确的手机号"],
            email: [/(^$)|^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/, "邮箱格式不正确"],
            url: [/(^$)|(^#)|(^http(s*):\/\/[^\s]+\.[^\s]+)/, "链接格式不正确"],
            number: [/(^$)|^\d+$/, '只能填写数字'],
            date: [/(^$)|^(\d{4})[-\/](\d{1}|0\d{1}|1[0-2])([-\/](\d{1}|0\d{1}|[1-2][0-9]|3[0-1]))*$/, "日期格式不正确"],
            identity: [/(^$)|(^\d{15}$)|(^\d{17}(x|X|\d)$)/, "请输入正确的身份证号"],
            multiFile: function (value, item) {
                if (!item.disabled) {
                    if ('[]' === value || '' === value) {
                        var name = $(item).parent().prev().text().replace('*', '');
                        if (name === null || name === undefined) {
                            name = '';
                        }
                        return "附件*" + name + "*不能为空!";
                    }
                }

            },
            required: function (value, item) {
                if (!item.disabled) {
                    if ('' === value) {
                        var name ='';
                         name = $(item).parent().prev().text().replace('*', '');
                         //console.log($(item).attr('name'));
                       // if (formTools.isEmpty(name)) {
                           // name = item.attr('placeholder');
                       // }
                        return "必填项*" + name + "*不能为空!";
                    }
                }
            }
        },

        model:{
            'input':'<div class="layui-inline  layui-col-xs${genlength} layui-col-md${genlength}">\n' +
                '\t<label class="layui-form-label"><span>*</span>${comments}</label>\n' +
                '\t<div class="layui-input-block">\n' +
                '\t\t<input id="${column}" name="${column}" type="text" lay-verify="required"\n' +
                '\t\t\t   class="layui-input baseInfo" autocomplete="off" />\n' +
                '\t</div>\n' +
                '</div>',
            'select':'<div class="layui-inline layui-col-xs${genlength} layui-col-md${genlength}" >\n' +
                '\t<label class="layui-form-label" ><span>*</span>${comments}</label>\n' +
                '\t<div class="layui-input-block">\n' +
                '\t\t<select name="${column}" id="${column}" lay-filter="${column}" lay-verify="required"\n' +
                '\t\t\t\tclass="layui-input baseInfo">\n' +
                '\t\t\t<option value="" selected>-请选择-</option>\n' +
                '\t\t\t@if(intermediary != null){\n' +
                '\t\t\t@for(state in intermediary){\n' +
                '\t\t\t<option value="${state.code}">${state.name}</option>\n' +
                '\t\t\t@}\n' +
                '\t\t\t@}\n' +
                '\t\t</select>\n' +
                '\t</div>\n' +
                '</div>',
            'file':'<div class="layui-inline  layui-col-xs12 layui-col-md12">\n' +
                '\t<label class="layui-form-label attachment-label"><span>*</span>${comments}</label>\n' +
                '\t<div class="layui-input-block">\n' +
                '\t\t<div class="layui-inline  layui-col-xs12 layui-col-md12 multi-file-div lastrow">\n' +
                '\t\t</div>\n' +
                '\t\t<button class="layui-btn btn-upload btn-multi-upload" id="${column}">添加附件</button>\n' +
                '\n' +
                '\t</div>\n' +
                '</div>',
            'radio':'<div class="layui-inline layui-col-xs${genlength} layui-col-md${genlength}" >\n' +
                '\t<label class="layui-form-label" ><span>*</span>${comments}</label>\n' +
                '\t<div class="layui-input-block">\n' +
                '\t\t<input type="radio" name="${column}" lay-filter="${column}" value="1" title="通过" />\n' +
                '\t\t<input type="radio" name="${column}" lay-filter="${column}" value="3" title="退回" />\n' +
                '\t</div>\n' +
                '</div>',
            'textarea':'<div class="layui-inline  layui-col-xs12 layui-col-md12">\n' +
                '\t<label class="layui-form-label text-area">${comments}</label>\n' +
                '\t<div class="layui-input-block">\n' +
                '\t\t<textarea name="${column}" id="${column}" placeholder="" class="layui-textarea"></textarea>\n' +
                '\t</div>\n' +
                '</div>',
            'entity':' /**\n' +
                        '  * ${comments}\n' +
                        '  */\n' +
                '  @TableField("${fieldName}")\n'+
                '  private ${jtype} ${column};\n'
            ,
            'result': ' /**\n' +
                        '  * ${comments}\n' +
                        '  */\n' +
                        '  private ${jtype} ${column};\n',
            'mapper':' wp.${fieldName} AS "${column}",'
        },
        /**
         * 下划线转驼峰
         */
        toHump: function (name) {
        return name.replace(/\_(\w)/g, function(all, letter){
            return letter.toUpperCase();
        });
    },
        /**
         * 上传附件按钮事件 初始化函数
         */
        uploadBtnBindEventInit: function (data) {
            data = data || '';
            var multiUploadBtn = $('.btn-multi-upload');

            for (var i = 0; i < multiUploadBtn.length; i++) {
                var btn = $(multiUploadBtn[i]);
                var id = btn.attr('id');
                var ftype = btn.attr('ftype');
                if (ftype == undefined || ftype == null) {
                    ftype = '';
                }
                // console.log(id, data[id], data);

                if (data === '' || data[id] === '' || data[id] === '[]' || data[id] === undefined) {
                    this.uploadEventBind(btn, true, [], ftype);
                } else {
                    this.uploadEventBind(btn, true, JSON.parse(data[id]), ftype);
                }
                $(multiUploadBtn[i]).click(function (e) {
                    return false;
                });
            }
            var singleUploadBtn = $('.btn-single-upload');
            for (var i = 0; i < singleUploadBtn.length; i++) {
                var btn = $(singleUploadBtn[i]);
                var id = btn.attr('id');
                var ftype = btn.attr('ftype');
                if (ftype == undefined || ftype == null) {
                    ftype = '';
                }
                if (data === '' || data[id] === '' || data[id] === '[]') {
                    this.uploadEventBind(btn, false, [], ftype);
                } else {
                    this.uploadEventBind(btn, false, JSON.parse(data[id]), ftype);
                }
                $(singleUploadBtn[i]).click(function (e) {
                    return false;
                });
            }
        },
        /**
         * 编辑文件 数据加载
         * @param data
         */
        renderFile: function (data, url) {
            this.uploadURL = url;
            this.uploadBtnBindEventInit(data);
            /* var multiUploadBtn = $('.btn-multi-upload');
             for (var i = 0; i < multiUploadBtn.length; i++) {
                 var uploadBtn = $(multiUploadBtn[i]);
                 //this.uploadEventBind($(multiUploadBtn[i]), true);
                 var btnId = uploadBtn.attr("id");
                 var value = data[btnId];
                 if(value===''||value==='[]')continue;
                 value = JSON.parse(value);
                 for (var j = 0; j < value.length; j++) {
                     this.addEditAttachment(uploadBtn.prev(),value[j],j+100,btnId,true);
                 }
             }
             var singleUploadBtn = $('.btn-single-upload');
             for (var i = 0; i < singleUploadBtn.length; i++) {
                 //this.uploadEventBind($(singleUploadBtn[i]), false);

             }*/
            this.fileLabelFix();
        },

        renderFile2: function (data, url) {
            this.uploadURL = url;
            this.deleteBtn = false;
            this.uploadBtnBindEventInit(data);
            this.fileLabelFix();
        },
        /**
         * 添加附件事件绑定
         * @param uploadBtn 添加附件按钮对象
         * @param isMulti 是否为多文件上传按钮
         * @param value
         * @param exts 文件格式 如："jpg|png"
         */
        uploadEventBind: function (uploadBtn, isMulti, value, exts) {
            var btnId = uploadBtn.attr("id");
            var ibtnElem = document.getElementById('i' + btnId);
            var btnElem = document.getElementById(btnId);
            var fileListView = uploadBtn.parent().children().eq(0);

            value = value || [];

            if ($(ibtnElem).length === 0) {
                //绑定input标签，用于存值
                var isRequired = uploadBtn.parent().prev().children('span').html() === '*';
                if (isRequired) {
                    uploadBtn.parent().append('<input type="hidden" id="i' + btnId + '" name="' + btnId + '" lay-verify="multiFile" value="" />');
                } else {
                    uploadBtn.parent().append('<input type="hidden" id="i' + btnId + '" name="' + btnId + '" value=""/>');
                }
            }
            ibtnElem = document.getElementById('i' + btnId);
            if (value.length > 0) $(ibtnElem).val(JSON.stringify(value));

            for (var i = 0; i < value.length; i++) {
                value[i].index = Math.floor(Math.random() * 1000) + '' + Math.floor(Math.random() * 1000);
                this.addEditAttachment(fileListView, value[i], value, btnId, true);
            }

            formTools.uploadListIns = upload.render({
                elem: btnElem
                , url: Feng.ctxPath + formTools.uploadURL //上传接口
                , accept: 'file'
                , multiple: false
                , auto: true
                , exts: exts
                , value: value
                , bindAction: '#btnSubmit'
                , choose: function (obj) {
                    var files = this.files = obj.pushFile(); //将每次选择的文件追加到文件队列
                    //读取本地文件
                    /* var ivalue = $('#i'+btnId).val();
                     if(ivalue ==''||ivalue=='[]'){
                         ivalue = '[]';
                     }
                     this.value = JSON.parse(ivalue);*/
                    var value = this.value;
                    obj.preview(function (index, file, result) {
                        //添加一个附件html
                        formTools.addAttachment(fileListView, file, index, value, btnId, isMulti);
                        //修改label样式padding
                        formTools.fixLabelPadding(uploadBtn.parent().prev());

                        /*          //单个重传
                                  tr.find('.demo-reload').on('click', function(){
                                      obj.upload(index, file);
                                  });

                                  //删除
                                  tr.find('.demo-delete').on('click', function(){
                                      delete files[index]; //删除对应的文件
                                      tr.remove();
                                      uploadListIns.config.elem.next()[0].value = ''; //清空 input file 值，以免删除后出现同名文件不可选
                                  });*/

                        // demoListView.append(html);
                    });
                }
                , done: function (res, index, upload) {
                    var files = this.files;
                    var valueOf = {};
                    valueOf.orignName = files[index].name;
                    valueOf.serverName = res.data;
                    valueOf.index = index;
                    valueOf.uploadTime = formTools.getDate() + ' ' + formTools.getTime();
                    var ivalue = $(ibtnElem).val();
                    if (ivalue == '' || ivalue == '[]') {
                        /*ivalue = JSON.parse(ivalue);
                        var synValue=[];
                        if(ivalue.length!==this.value.length){
                            for (var i = 0; i <ivalue.length ; i++) {

                            }
                        }*/
                        ivalue = '[]';
                    }

                    if (!isMulti) {
                        this.value.splice(0, this.value.length);
                    }
                    // this.value = JSON.parse(ivalue);

                    this.value.push(valueOf);

                    $(ibtnElem).val(JSON.stringify(formTools.parseMultiFileParams(this.value)));


                    delete files[index];
                    // console.log(files);

                    /* if(res.files.file){ //上传成功
                         var tr = fileListView.find('tr#upload-'+ index)
                             ,tds = tr.children();
                         tds.eq(2).html('<span style="color: #5FB878;">上传成功</span>');
                         tds.eq(3).html(''); //清空操作
                         return delete this.files[index]; //删除文件队列已经上传成功的文件
                     }
                     this.error(index, upload);*/
                }
                , error: function (index, upload) {
                    /* var tr = fileListView.find('tr#upload-'+ index)
                         ,tds = tr.children();
                     tds.eq(2).html('<span style="color: #FF5722;">上传失败</span>');
                     tds.eq(3).find('.demo-reload').removeClass('layui-hide'); //显示重传*/
                }
            });

        },
        /**
         * 附件添加点击事件, 同时给当前附件绑定删除事件
         * @param obj 存放html的divList
         * @param file 当前文件对象
         * @param index 当前文件索引
         * @param value 当前已经添加的文件的相关数据，用于删除按钮事件绑定
         * @param btnId 要上传的按钮的id
         * @param isMulti 是否为多文件
         */
        addAttachment: function (obj, file, index, value, btnId, isMulti) {
            var upTime = formTools.getDate() + ' ' + formTools.getTime();
            var deleteHtml = '<div class="layui-inline  layui-col-xs1 layui-col-md1 delete-icon-div" >\n' +
                '                  <a class="layui-btn  layui-btn-xs file-delete-btn" id="' + index + '" ><i class="layui-icon">&#xe640;</i></a>\n' +
                '            </div>\n';

            var previewHtml = '<div class="layui-inline  layui-col-xs1 layui-col-md1 delete-icon-div" >\n' +
                '                  <a class="layui-btn layui-btn-xs layui-btn-normal file-preview-btn" id="preview' + index + '" >预览</a>\n' +
                '            </div>\n';


            var html = ' <div class="layui-inline  layui-col-xs12 layui-col-md12" >\n' +
                '           <div class="layui-inline  layui-col-xs10 layui-col-md10 file-list" >\n' +
                '               <div class="layui-inline layui-col-xs9 layui-col-md9 layui-upload-choose upload-file-name" title="' + file.name + '">' + file.name + ' </div>\n' +
                '               <div class="layui-inline layui-col-xs3 layui-col-md3 layui-upload-choose upload-file-time" title="' + upTime + '" style="float: right">上传时间:' + upTime + ' </div>\n' +
                '           </div>\n' +
                previewHtml +
                deleteHtml +
                '      </div>';
            if (isMulti) {
                obj.append(html);
            } else {
                obj.html(html);
            }
            /**
             * 预览文件
             */
            //文件预览本地
            $('#preview' + index).click(function (e) {
                let fileName;
                for (var i = 0; i < value.length; i++) {
                    if (value[i].index === index) {
                        fileName = value[i].serverName;
                    }
                }
                window.open(Feng.ctxPath + "/filehandler/preview?fileName=" + encodeURIComponent(fileName));
            });


            //绑定删除附件删除事件
            $('#' + index).click(function (e) {
                formTools.deleteAttachment($(this));
                for (var i = 0; i < value.length; i++) {
                    if (value[i].index === index) {
                        value.splice(i, 1);
                    }
                }
                $(document.getElementById("i" + btnId)).val(JSON.stringify(formTools.parseMultiFileParams(value)));
            });
        },

        /**
         * 编辑时显示文件
         * @param obj 存放html的divList
         * @param data 数据json
         * @param index 当前文件索引
         * @param value 当前已经添加的文件的相关数据，用于删除按钮事件绑定
         * @param btnId 要上传的按钮的id
         * @param isMulti 是否为多文件
         */
        addEditAttachment: function (obj, data, value, btnId, isMulti) {
            var upTime = data.uploadTime === undefined ? '暂无数据' : data.uploadTime;
            var deleteHtml = '';
            if (formTools.deleteBtn) {
                deleteHtml = '<div class="layui-inline  layui-col-xs1 layui-col-md1 delete-icon-div" >\n' +
                    '                  <a class="layui-btn  layui-btn-xs file-delete-btn" id="' + data.index + '" ><i class="layui-icon">&#xe640;</i></a>\n' +
                    '            </div>\n';
            }

            var previewHtml = '<div class="layui-inline  layui-col-xs1 layui-col-md1 delete-icon-div" >\n' +
                '                  <a class="layui-btn layui-btn-xs layui-btn-normal file-preview-btn" id="preview' + data.index + '" >预览</a>\n' +
                '            </div>\n';

            var html = ' <div class="layui-inline  layui-col-xs12 layui-col-md12" >\n' +
                '           <div class="layui-inline  layui-col-xs10 layui-col-md10 file-list" >\n' +
                '               <div class="layui-inline layui-col-xs9 layui-col-md9 layui-upload-choose upload-file-name" title="' + data.orignName + '">' + data.orignName + ' </div>\n' +
                '               <div class="layui-inline layui-col-xs3 layui-col-md3 layui-upload-choose upload-file-time" title="' + upTime + '" style="float: right">上传时间:' + upTime + ' </div>\n' +
                '           </div>\n' +
                previewHtml +
                deleteHtml +
                '      </div>';
            if (isMulti) {
                obj.append(html);
            } else {
                obj.html(html);
            }
            //console.log(obj.attr('name'), html);
            /**
             * 预览文件
             */
            //文件预览本地
            $('#preview' + data.index).click(function (e) {
                let fileName;
                for (var i = 0; i < value.length; i++) {
                    if (value[i].index === data.index) {
                        fileName = value[i].serverName;
                    }
                }
                window.open(Feng.ctxPath + "/filehandler/preview?fileName=" + encodeURIComponent(fileName));
            });

            //绑定删除附件删除事件
            $('#' + data.index).click(function (e) {
                formTools.deleteAttachment($(this));
                for (var i = 0; i < value.length; i++) {
                    if (value[i].index === data.index) {
                        value.splice(i, 1);
                    }
                }
                $(document.getElementById("i" + btnId)).val(JSON.stringify(formTools.parseMultiFileParams(value)));
            });
        },
        /**
         * 详情页 上传附件按钮 初始化
         */
        uploadBtnDetailInit: function () {
            var uploadBtn = $('.btn-multi-upload,.btn-single-upload');
            for (var i = 0; i < uploadBtn.length; i++) {
                var btn = $(uploadBtn[i]);
                btn.parent().append('<input type="hidden" name="' + btn.attr("id") + '" value=""/>');
            }
        },
        /**
         *
         * @param ids
         */
        opinionEvent: function (ids) {
            if (ids === null || ids === '' || ids === undefined) {
                return
            }
            for (var i = 0; i < ids.length; i++) {
                form.on('radio(' + ids[i] + ')', function (data) {
                    if (data.value === '1') {
                        $(this).parent().parent().next().hide();
                    }
                    if (data.value === '3') {
                        $(this).parent().parent().next().show();
                    }
                });

            }
        },
        isEmpty: function(name){
            if(name===''||name===null||name===undefined){
                return true;
            }
            return false;
        },
        //判断是否是数字
        isRealNum: function (val) {
            if (val === "" || val == null) {
                return false;
            }
            if (!isNaN(val)) {

                return true;
            } else {
                return false;
            }
        },


        /**
         * 将表单转换为label
         * @param id form表单id
         */
        formReplace: function (id) {
            id = '#' + id;
            this.textReplace(id);
            this.radioReplace(id);
            this.selectReplace(id);
            this.checkBoxReplace(id);
            this.textareaReplace(id);
            this.fileReplace(id);

            var notInitElemName = ['fileDownload', 'reprotApproval', 'btn1', 'btn2'];
            var inputElement = $(id + ' input[type = button]');
            for (var i = 0; i < inputElement.length; i++) {
                var input = $(inputElement[i]);
                var name = input.attr('name');
                var type = input.attr('type');
                if (notInitElemName.indexOf(name) < 0) {
                    input.remove();
                }
            }

            // $(id +' input[type = button]').remove();
            $(id + ' .layui-form-label span').remove();
            var lables = $(id).children().find('.multi-file-div');
            for (var i = 0; i <lables.length ; i++) {
                let elem = $(lables[i]);
                elem.parent().prev().css('padding-top','');
                elem.parent().prev().css('padding-bottom','');
            }
        },
        /**
         * 文件详情显示
         */
        fileReplace: function (id) {
            var files = $(id + ' input[type = hidden]');
            for (var i = 0; i < files.length; i++) {
                var file = $(files[i]);
                if (formTools.formReplaceExcept.indexOf(file.attr("name")) >= 0) {
                    return;
                }
                if (file.attr('title') == 'ignore') {
                    continue;
                }
                if (file.val() === '') {
                    file.parent().html("");
                    continue;
                }
                var value = JSON.parse(file.val());
                var html = '<div  class="layui-inline  layui-col-xs12 layui-col-md12 multi-file-div lastrow">\n';
                for (var j = 0; j < value.length; j++) {
                    var upTime = value[j].uploadTime === undefined ? '暂无数据' : value[j].uploadTime;
                    html += '<div class="layui-inline  layui-col-xs12 layui-col-md12">\n' +
                        '       <div class="layui-inline  layui-col-xs12 layui-col-md12 file-detail-list">\n' +
                        '           <div class="layui-inline layui-upload-choose layui-col-xs8 layui-col-md8 layui-upload-choose upload-file-name"><a href="#" title="' + value[j].orignName + '" onclick="fileDownload(\'' + value[j].serverName + '\',\'' + value[j].orignName + '\')">' + value[j].orignName + '</a></div>\n' +
                        '            <div class="layui-inline layui-col-xs3 layui-col-md3 layui-upload-choose upload-file-time" title="' + upTime + '">上传时间:' + upTime + ' </div>\n' +
                        '            <div class="layui-inline  layui-col-xs1 layui-col-md1 delete-icon-div" ><a class="layui-btn layui-btn-xs layui-btn-normal file-preview-btn" onclick="filePreview(\'' + value[j].serverName + '\')">预览</a></div>\n' +
                        '        </div>\n' +
                        '  </div>';
                }
                html += '</div>';
                file.parent().html(html);
            }


            this.fileLabelFix();
        },
        /**
         * 添加单个文件
         * @param name
         * @param value
         */
        addOneFile: function (name, value) {
            if (value === undefined || value === '' || value === null) return;
            var file = $('input[name = ' + name + ']');
            file.val(JSON.stringify(value));

            for (var i = 0; i < file.length; i++) {
                var fl = $(file[i]);
                var html = '';
                for (var j = 0; j < value.length; j++) {
                    var val = value[j];
                    var upTime = val.uploadTime === undefined ? '暂无数据' : val.uploadTime;
                    html += '<div class="layui-inline  layui-col-xs12 layui-col-md12">\n' +
                        '       <div class="layui-inline  layui-col-xs12 layui-col-md12 file-detail-list">\n' +
                        '           <div class="layui-inline layui-upload-choose layui-col-xs9 layui-col-md9 layui-upload-choose upload-file-name"><a href="#" title="' + val.orignName + '" onclick="fileDownload(\'' + val.serverName + '\',\'' + val.orignName + '\')">' + val.orignName + '</a></div>\n' +
                        '            <div class="layui-inline layui-col-xs3 layui-col-md3 layui-upload-choose upload-file-time" title="' + upTime + '" style="float: right">生成时间:' + upTime + ' </div>\n' +
                        '        </div>\n' +
                        '  </div>';
                }
                fl.parent().find('.multi-file-div').html(html);
            }
            ;

            this.fileLabelFix();
        },



        /**
         *  text,number转换
         * @param id
         */
        textReplace: function (id) {
            var inputElement = $(id + ' input[type = text]:not(table input), ' + id + ' input[type = number]:not(table input),' + id + ' input[type = hidden]:not(table input)');
            $(id + ' tr input').attr('readOnly','readOnly');
            for (var i = 0; i < inputElement.length; i++) {
                var input = $(inputElement[i]);
                var value = input.val();
                var type = input.attr('type');
                if (formTools.formReplaceExcept.indexOf(input.attr("name")) < 0 && type != 'hidden') {
                    input.parent().html('<label class="label-content">' + value + '</label>');
                }
            }
        },
        /**
         *  radio转换
         * @param id
         */
        radioReplace: function (id) {
            var radios = $(id + ' input[type = radio]:checked');
            for (var i = 0; i < radios.length; i++) {
                var input = $(radios[i]);
                var value = input.attr('title');
                if (formTools.formReplaceExcept.indexOf(input.attr("name")) < 0) {
                    input.parent().html('<label class="label-content">' + value + '</label>');
                }
            }
            var radios1 = $(id + ' input[type = radio]');
            for (var i = 0; i < radios1.length; i++) {
                var input = $(radios1[i]);
                let clazz = '';
                if (this.formatEmpty(input.attr('class')) != '') {
                    clazz = input.attr('class');
                }
                if (formTools.formReplaceExcept.indexOf(input.attr("name")) < 0) {
                    input.parent().html('<label class="label-content ' + clazz + '"></label>');
                }
            }
        },
        /**
         *  select转换
         * @param id
         */
        selectReplace: function (id) {
            var selects = $(id + ' .layui-select-title:not(tr .layui-select-title)');
            $(id + ' tr select').attr('disabled','disabled');
            for (var i = 0; i < selects.length; i++) {
                var content = $(selects[i]).html();
                $(selects[i]).parent().parent().html(content);
            }
        },
        /**
         *  checkBox转换
         * @param id
         */
        checkBoxReplace: function (id) {
            $(id + ' input[type=checkbox]').attr('disabled', 'disabled');
            form.render('checkbox');
        },
        /**
         *  textarea转换
         * @param id
         */
        textareaReplace: function (id) {
            $(id + ' textarea').attr('readonly', 'readonly');
            $(id + ' textarea').removeAttr('lay-verify');
        },
        /**
         * 填充特殊类型字段 radio, 附件
         * @param id
         */
        specialShow: function (id) {
            id = '#' + id;
            var radios = $(id + ' input[type = radio]:checked');
            for (var i = 0; i < radios.length; i++) {
                var input = $(radios[i]);
                var value = input.attr('title');
                input.parent().parent().find('.layui-input-block').css('display', 'none');
                input.parent().parent().find('.ra-tmp').remove();
                input.parent().parent().append('<div class="layui-input-block ra-tmp"><label class="label-content">' + value + '</label> </div>');
            }

            var files = $(id + ' input[type = hidden]');
            for (var i = 0; i < files.length; i++) {
                var file = $(files[i]);
                if (file.val() === '') {
                    file.parent().html("");
                    continue;
                }
                var value = JSON.parse(file.val());

                var html = '<div  class="layui-inline  layui-col-xs12 layui-col-md12 multi-file-div lastrow">\n';
                for (var j = 0; j < value.length; j++) {
                    var upTime = value[j].uploadTime === undefined ? '暂无数据' : value[j].uploadTime;
                    html += '<div class="layui-inline  layui-col-xs12 layui-col-md12">\n' +
                        '       <div class="layui-inline  layui-col-xs12 layui-col-md12 file-detail-list">\n' +
                        '           <div class="layui-inline layui-upload-choose layui-col-xs9 layui-col-md9 layui-upload-choose upload-file-name"><a href="#" title="' + value[j].orignName + '" onclick="fileDownload(\'' + value[j].serverName + '\',\'' + value[j].orignName + '\')">' + value[j].orignName + '</a></div>\n' +
                        '            <div class="layui-inline layui-col-xs3 layui-col-md3 layui-upload-choose upload-file-time" title="' + upTime + '" style="float: right">上传时间:' + upTime + ' </div>\n' +
                        '        </div>\n' +
                        '  </div>';
                }
                html += '</div>';
                file.parent().find('.multi-file-div').remove();
                file.parent().append(html);
            }
        },



        /**
         * 根据传入ID数组，设置必填项
         * @param requredArrayIds
         *
         */
        setRequired: function(requredArrayIds){
            var rIds=requredArrayIds||[];

            for (var i = 0; i <rIds.length ; i++) {
                //var elem =  $('#'+rIds[i]);

                var elem =  $('[name='+rIds[i]+']');
                if(elem.length>0){
                    elem.attr('lay-verify','required');
                    var html = elem.parent().prev().html();
                    html = html.replace(/<span>\*<\/span>/g,'');
                    elem.parent().prev().html('<span>*</span>'+html);
                }

            }
        },

        /**
         * 根据传入ID数组，设置不必填项
         * @param notRequredArrayIds
         *
         */
        setNotRequired: function(notRequredArrayIds){
            var rIds=notRequredArrayIds||[];
            for (var i = 0; i <rIds.length ; i++) {
                //var elem =  $('#'+rIds[i]);
                var elem = $('[name=' + rIds[i] + ']');
                if(elem.length>0) {
                    elem.removeAttr('lay-verify');
                    elem.parent().prev().find('span').remove();
                }
            }
        },
        /**
         * 动态表格输入生成 添加
         * @param id tbody id
         */
        tableAdd: function(id){

            if(formTools.isEmpty(formTools.dyTable[id+'Count'])){
                formTools.dyTable[id+'Count'] = $('#'+id+' tr').length -1;
            }
            if(formTools.isEmpty(formTools.dyTable[id+'htmlStr'])){
                formTools.dyTable[id+'htmlStr'] = $("#"+ id +" .tr0").html();
            }
            if(formTools.isEmpty(formTools.dyTable[id+'initCount'])){
                var reg = /isort="" value="([0-9]*?)"/g;
                reg.test(formTools.dyTable[id+'htmlStr']);
                if(formTools.isRealNum(RegExp.$1)){
                    formTools.dyTable[id+'initCount'] =  parseInt(RegExp.$1);
                }else {
                    formTools.dyTable[id+'initCount'] = 0;
                }

            }
            formTools.dyTable[id+'Count']++;
            var payCount = formTools.dyTable[id+'Count'];
            var initCount = formTools.dyTable[id+'initCount'];
            var outerDivStr = '<tr class="tr'+ payCount +' dytable">';
            var outerDivStrEnd = '</tr>';
            var htmlStr = formTools.dyTable[id+'htmlStr'];
            if(formTools.isEmpty(htmlStr)) return;
            var reg = new RegExp("\\[0\\]","g");

            htmlStr = htmlStr.replace(reg,'['+payCount+']');
            htmlStr = htmlStr.replace(/isort="" value="[0-9]*?"/g,'isort="" value="'+(payCount + initCount)+'"');
            htmlStr = htmlStr.replace(/lay-key.*?\d\"/g,'');//select初始化

            $("#" + id).append(outerDivStr + htmlStr + outerDivStrEnd);
            form.render('select');
            var lables = $("#" + id).parents().find('.countryList:last').find('.layui-form-label');
            for (var i = 0; i <lables.length ; i++) {
                formTools.fixLabelPadding($(lables[i]));
            }
        },

        /**
         * 动态表格输入生成 删除
         * @param id tbody id
         */
        tableDelete: function(id){
            if(formTools.isEmpty(formTools.dyTable[id+'Count'])){
                formTools.dyTable[id+'Count'] = $('#'+id+' tr').length -1;
                Feng.error("请填写或修改内容！");
                return;
            }
            var payCount = formTools.dyTable[id+'Count'];

            if(payCount === 0){
                Feng.error("请填写或修改内容！");
                return;
            }
            $("#"+ id +" .tr"+ payCount).remove();
            formTools.dyTable[id+'Count']--;

            var lables = $("#" + id).parents().find('.countryList:last').find('.layui-form-label');
            for (var i = 0; i <lables.length ; i++) {
                formTools.decLabelPadding($(lables[i]),28.5);
            }
        },
        /**
         * 动态表格输入生成
         * @param id tbody id
         */
        tableGen: function(id, funs){
            if(formTools.isEmpty(funs)){
                funs = {
                    afterAdd:function (e) {},
                    afterDelete:function (e) {},
                    after:function (e) {}
                }
            }
            $('#'+id).parent().next().find('[tbclick=add]').click(function (e) {
                formTools.tableAdd(id);
                if(!formTools.isEmpty(funs.afterAdd)){
                    funs.afterAdd(formTools.dyTable[id+'Count']);
                }
            });
            $('#'+id).parent().next().find('[tbclick=delete]').click(function (e) {
                formTools.tableDelete(id);

                if(!formTools.isEmpty(funs.afterDelete)){
                    funs.afterDelete(formTools.dyTable[id+'Count']);
                }
            });
            if(!formTools.isEmpty(funs.after)){
                funs.after(formTools.dyTable[id+'Count']);
            }
        },

        tableInit: function(id, listName, data, funs){
            if(formTools.isEmpty(data)||formTools.isEmpty(listName)){return;}
            for (var i = 0; i < data[listName].length; i++) {
                var tmp = data[listName][i];
                for(var key in tmp){
                    data[listName+'['+i+'].'+key] = tmp[key];
                }
                if(i !==0){
                    formTools.tableAdd(id);
                }
            }
            if(formTools.isEmpty(funs)){
                funs = {
                    after:function (e) {}
                }
            }
            if(!formTools.isEmpty(funs.after)){
                funs.after(formTools.dyTable[id+'Count']);
            }

        },
        /**
         * 修改label的高度，自动适配
         * @param elem
         */
        fixLabelPadding: function (elem) {
            var height = elem.parent().height();
            var padding = (height - 20) / 2;
            elem.css('padding-top', padding + 'px');
            elem.css('padding-bottom', padding + 'px');
        },
        /**
         * 减小label的高度
         * @param elem 要修改的label,
         * @param value 要减少的padding上下的值
         */
        decLabelPadding: function (elem, value) {
            var height = (elem.innerHeight() - 20) / 2;
            var padding = height - value;
            elem.css('padding-top', padding + 'px');
            elem.css('padding-bottom', padding + 'px');
        },
        /**
         * 初始化页面label高度
         */
        labelCssInit: function () {
            var label = $('.layui-form-label');
            for (var i = 0; i < label.length; i++) {
                if ($(label[i]).attr('style') !== undefined) continue;
                this.fixLabelPadding($(label[i]));
            }
        },
        /**
         * 文件label高度修复
         */
        fileLabelFix: function () {
            var label = $('.multi-file-div').parent().prev();
            for (var i = 0; i < label.length; i++) {
                //if($(label[i]).attr('style')!==undefined)continue;
                this.fixLabelPadding($(label[i]));
            }
        },
        /**
         * 删除附件
         * @param obj
         */
        deleteAttachment: function (obj) {
            this.decLabelPadding($(obj).parent().parent().parent().parent().prev(), 17);
            $(obj).parent().parent().remove();
        },
        /**
         * 格式化多附件上传数据格式
         * @param value: upload对象中的value
         * @returns {[]}
         */
        parseMultiFileParams: function (value) {
            var param = [];
            for (var i = 0; i < value.length; i++) {
                var temp = {};
                temp.orignName = value[i].orignName;
                temp.serverName = value[i].serverName;
                temp.uploadTime = value[i].uploadTime;
                param.push(temp)
            }
            return param;
        },
        /**
         * 添加 checkbox , 仅适用于竣工结算页面html
         * @param name
         * @param elem
         */
        addCheckBox: function (name, elem) {
            var value = $(elem).prev().val();
            if (value.trim() === '') return;
            $(elem).prev().val("");
            value = value.replaceAll("\"", "");
            var html = '<input type="checkbox" name="' + name + '" value="' + value + '" title="' + value + '" lay-skin="primary">';
            $(elem).parent().prev().append(html);
            $(elem).parent().prev().css('display', 'block');
            form.render();
            this.fixLabelPadding($(elem).parent().parent().children(":first"));
            this.fixLabelPadding($(elem).parent().parent().parent().parent().children(":first"));
        },
        /**
         * 获取checkbox的值
         * @param boxName
         * @return string 用‘,’ 分隔多个取值
         */
        getCheckBoxValues: function (boxName) {
            var checked = [];
            $('input[name=' + boxName + ']:checked').each(function () {
                checked.push($(this).val());
            });
            return checked.join(',');
        },
        /**
         * 填充checkbox的值
         * @param filedName
         * @param value
         */
        fillCheckBox: function (filedName, value) {
            if (value === '') return;
            var value1 = $('input[name=' + filedName + ']').eq(0).val();
            var checkedValue = value.split(',');
            if (checkedValue.indexOf(value1) < 0) {
                $('input[name=' + filedName + ']').eq(0).attr('checked', false);
            }
            for (var i = 0; i < checkedValue.length; i++) {
                $('input[name=' + filedName + '][value=' + checkedValue[i] + ']').attr('checked', 'checked');
            }
            form.render('checkbox');
        },
        /**
         * 开始结束时间事件绑定
         * @param startDateId 开始日期控件id
         * @param endDateId 结束日期控件id
         */
        twoDateEvent: function (startDateId, endDateId) {

            laydate.render({
                elem: document.getElementById(startDateId)
                , done: function (value, date, endDate) {
                    var startDate = new Date(value).getTime();
                    var endTime = new Date($(document.getElementById(endDateId)).val()).getTime();
                    if (endTime < startDate) {
                        layer.msg('开始日期不能小于结束日期', {icon: 5, anim: 0});
                        $(document.getElementById(startDateId)).val($(document.getElementById(endDateId)).val());
                    }
                }
                , trigger: 'click'
            });

            laydate.render({
                elem: document.getElementById(endDateId)
                , done: function (value, date, endDate) {
                    var startDate = new Date($(document.getElementById(startDateId)).val()).getTime();
                    var endTime = new Date(value).getTime();
                    if (endTime < startDate) {
                        layer.msg('开始日期不能小于结束日期', {icon: 5, anim: 0});
                        $(document.getElementById(startDateId)).val($(document.getElementById(endDateId)).val());
                    }
                }
                , trigger: 'click'
            });
        },
        /**
         * 时间事件绑定
         * @param dateIds 结束日期控件ids ['id1','id2']
         */
        dateEvent: function (dateIds) {
            if (dateIds === null || dateIds === '' || dateIds === undefined) {
                return;
            }
            for (var i = 0; i < dateIds.length; i++) {
                var startDateId = dateIds[i];
                laydate.render({
                    elem: document.getElementById(startDateId)
                    , trigger: 'click'
                });
            }

        },


        /**
         * layui select选择时，附带option的文本内容
         * @param data ;select data
         * @param thisElem
         */
        selectWithName: function (data, thisElem) {
            var value = data.value;

            if ((data.elem.name).indexOf('Id') !== -1) {
                var name = (data.elem.name).replace('Id', 'Name');
                var optText = $(thisElem).html();
                if (value === '') {
                    optText='';
                }
                var input = $(thisElem).parent().parent().parent().find('input[name='+name+']');
                if (input.length === 0) {
                    $(thisElem).parent().parent().parent().append('<input type="hidden" name="' + name + '" value="' + optText + '">');
                } else {
                    input.val(optText);
                }
            } else if ((data.elem.name).indexOf('Code') !== -1) {
                var name = (data.elem.name).replace('Code', 'Name');
                var optText = $(thisElem).html();
                if (value === '') {
                    optText='';
                }
                var input = $(thisElem).parent().parent().parent().find('input[name='+name+']');
                if (input.length === 0) {
                    $(thisElem).parent().append('<input type="hidden" name="' + name + '" value="' + optText + '">');
                } else {
                    input.val(optText);
                }
            }
        },
        /**
         * 动态设置select option
         *  后台接口返回值为[{'keyName1':value1, 'valueName1':value2},{'keyName2':value1, 'valueName2':value2}]
         * name, select 名称，name属性
         * url， url
         * params, 相关参数
         * conf,配置，配置默认 keyName,valueName
         * func(res) 回调函数，可自定义处理后台返回值
         * @returns
         */
        setSelectFromUrl:function(name, url, params, conf, func){
            var aurl = url||'';
            var aparams = params||{};

            if(formTools.isEmpty(aurl)){
                return false;
            }
            $.post(aurl, aparams,function (res) {
                if(!formTools.isEmpty(func)){
                    res = func(res);
                }
                formTools.setSelect(name, res, conf);
            },'json');



        },
        /**
         * 动态设置select option
         * name, select 名称，name属性
         * data, 需要设置的key value值,格式：[{'keyName1':value1, 'valueName1':value2},{'keyName2':value1, 'valueName2':value2}]
         * conf,配置，配置默认 keyName,valueName
         * @returns
         */
        setSelect: function(name, data, conf){

            if(formTools.isEmpty(name)||formTools.isEmpty(data)){
                return false;
            }
            var keyName = 'id';
            var valueName ='name';
            if(!formTools.isEmpty(conf)){
                keyName = conf.keyName||'id';
                valueName = conf.valueName||'name';
            }
            var html = '<option value="" selected>-请选择-</option>';
            for (var i = 0; i <data.length ; i++) {
                 html += '<option value="'+ data[i][keyName] +'">'+ data[i][valueName] + '</option>';
            }

            $('select[name='+name+']').html(html);
            form.render('select');
        },
        /**
         * 获取格式化日期 yyyy-MM-dd
         * @returns {string}
         */
        getDate: function () {
            // 获取当前日期
            var date = new Date();
            // 获取当前月份
            var nowMonth = date.getMonth() + 1;
            // 获取当前是几号
            var strDate = date.getDate();
            // 添加分隔符“-”
            var seperator = "-";
            // 对月份进行处理，1-9月在前面添加一个“0”
            if (nowMonth >= 1 && nowMonth <= 9) {
                nowMonth = "0" + nowMonth;
            }
            // 对月份进行处理，1-9号在前面添加一个“0”
            if (strDate >= 0 && strDate <= 9) {
                strDate = "0" + strDate;
            }
            // 最后拼接字符串，得到一个格式为(yyyy-MM-dd)的日期
            return date.getFullYear() + seperator + nowMonth + seperator + strDate;
        },
        /**
         * 获取时间 HH:mm
         */
        getTime: function () {
            var now = new Date();
            var hh = now.getHours();            //时
            var mm = now.getMinutes();          //分
            var clock = '';
            if (hh < 10)
                clock += '0';
            clock += hh + ':';
            if (mm < 10)
                clock += '0';
            clock += mm;
            return clock;
        },


        scrollTop: function (id) {
            if ($('#' + id).length === 0) {
                return;
            }
            $("html,body").animate({
                scrollTop: $('#' + id).offset().top - 500
            }, 500);
        },
        /**
         * 数据校验
         * @param obj
         * @returns {string|*}
         */
        formatEmpty: function (obj) {
            if (typeof obj === 'undefined' || obj == null || obj === '' || obj === 'null' || obj === 'NaN') {
                return '';
            } else {
                return obj;
            }
        },

        /**
         * 通用初始化事件
         */
        commonEventInit: function () {
            //将某些select的option的文本加入input
            form.on('select(withName)', function (data) {
                formTools.selectWithName(data, this);
            });

        },

        //初始化上传文件按钮
        render: function (url) {
            this.uploadURL = url;
            this.uploadBtnBindEventInit();
        },

    };


    //监听单选框数据
    //获取选中的tr
    var data_tr;
    table.on('radio(table1)',function (obj) {
        data_tr = $(this);

    });
    //上移
    $(".upformButton").on("click",function() {
        var tbData = table.cache.table1; //是一个Array
        if (data_tr == null) {
            layer.msg("请选择元素");
            return;
        }
        var tr = $(data_tr).parent().parent().parent();

        if ($(tr).prev().html() == null) {
            layer.msg("已经是最顶部了");
            return;
        }else{
            // 未上移前，记录本行和下一行的数据
            var tem = tbData[tr.index()];
            var tem2 = tbData[tr.prev().index()];

            // 将本身插入到目标tr之前
            $(tr).insertBefore($(tr).prev());
            // 上移之后，数据交换
            tbData[tr.index()] = tem;
            tbData[tr.next().index()] = tem2;

        }
    });
    // 下移
    $(".downformButton").on("click",function() {
        var tbData = table.cache.table1;
        if (data_tr == null) {
            layer.msg("请选择元素");
            return;
        }
        var tr = $(data_tr).parent().parent().parent();
        if ($(tr).next().html() == null) {
            layer.msg("已经是最底部了");
            return;
        } else{
            // 记录本行和下一行的数据
            var tem = tbData[tr.index()];
            var tem2 = tbData[tr.next().index()];
            // 将本身插入到目标tr的后面
            $(tr).insertAfter($(tr).next());
            // 交换数据
            tbData[tr.index()] = tem;
            tbData[tr.prev().index()] = tem2;
            confirmData();
        }

    });

    //表单元素确认顺序按钮
    $(".confirmormButton").on("click",function (){
        // 已经调整好顺序了
        confirmData();
        // $.ajax({
        //     url: ajaxRoot,
        //     contentType: "application/json",
        //     type: "post",
        //     dataType: 'json',
        //     data: params,
        //     success: function (res) {
        //         layer.msg("确认成功", {icon: 6});
        //         // 重载表格
        //         table.reload('testReload', {
        //         });
        //     }
        //
        // });

    });

    function confirmData(){
        var tbData = table.cache.table1;

        // 用于存放elementKey和elementOrder，主键和排序字段，用于后台更新
        var data = [];
        for (var i = 0; i < tbData.length; i++) {
            var elementKey = tbData[i].elementKey;
            var elementOrder = i + 1;
            data.push({
                "elementKey":elementKey,
                "elementOrder":elementOrder
            });
        }
        //table.reload('table1', {
            //data:tbData
        //});
        //console.log(table.cache.table1)
    }

    formTools.commonEventInit();
    exports('formTools', formTools);


});



