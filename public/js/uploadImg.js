$().ready(function() {
    var imgFun = {
        showFun: function(e, imgName) {
            var val = e.value;
            var upLoadType = '.jpg,.png'; ///可上传的格式
            var fileExt = val.substr(val.lastIndexOf(".")).toLowerCase(); //从字符串中抽出最后一次出现.之后的字符，并且转换成小写
            var result = upLoadType.indexOf(fileExt); //查找后缀名是否符合条件，如果符合返回>=0，如果不符合则返回负数;
            var oFReader = new FileReader();
            if (e.files.length === 0) {
                return;
            }
            var oFile = e.files[0]; //如果只有一个文件则只需要访问这个FileList对象中的第一个元素.
            if (result < 0) {
                layer.msg('您上传的格式有误！');
                e.value = null;
                return;
            }
            oFReader.readAsDataURL(oFile); // 开始在后台进行读取操作。当图像文件的所有内容加载后,他们转换成一个data:URL,传递到onload回调函数中
            oFReader.onload = function(oFREvent) {
                //当读取操作成功完成时调用.
                $('#' + imgName + 'Img').attr('src', oFREvent.target.result);
            };
        },
        sizeFun: function(e) {
            var size=e.target.files[0].size;
        var maxsize=2*1024*1024;
        if(size>maxsize){
            layer.msg('您上传的文件过大!');
            return false;
        }else{
            return true;
        }
        }
    }
    var shangSize = $('#shang').on('change', function(e) {
        if(imgFun.sizeFun(e)){
            imgFun.showFun(this,'shang');
            return true;
        }else{
           $(this).val(null);
            return;
        };
    });
    var xiaSize = $('#xia').on('change', function(e) {
        if(imgFun.sizeFun(e)){
            imgFun.showFun(this,'xia');
            return true;
        }else{
            $(this).val(null);
            return;
        };
    });
    var zuoSize = $('#zuo').on('change', function(e) {
        if(imgFun.sizeFun(e)){
            imgFun.showFun(this,'zuo');
            return true;
        }else{
            $(this).val(null);
            return;
        };
    });
    var youSize = $('#you').on('change', function(e) {
       if(imgFun.sizeFun(e)){
            imgFun.showFun(this,'you');
            return true;
        }else{
            $(this).val(null);
            return;
        };
    });
    var qianSize = $('#qian').on('change', function(e) {
       if(imgFun.sizeFun(e)){
            imgFun.showFun(this,'qian');
            return true;
        }else{
            $(this).val(null);
            return;
        };
    });
    var hougSize = $('#hou').on('change', function(e) {
        if(imgFun.sizeFun(e)){
            imgFun.showFun(this,'hou');
            return true;
        }else{
            $(this).val(null);;
            return;
        };
    });
    $('#submit').off('click').on('click', function() {
        if ($('.sightTitle').val().length > 0) {
            if ($('.sightDis').val().length > 0) {
                if ($('#shang').val().length && $('#xia').val().length && $('#zuo').val().length && $('#you').val().length && $('#qian').val().length && $('#hou').val().length) {
                    var index=layer.load(0, {shade: [0.3,'#000']});
                    var imgFd = new FormData();
                    imgFd.append('shang', $('#shang').prop('files')[0]);
                    imgFd.append('xia', $('#xia').prop('files')[0]);
                    imgFd.append('zuo', $('#zuo').prop('files')[0]);
                    imgFd.append('you', $('#you').prop('files')[0]);
                    imgFd.append('qian', $('#qian').prop('files')[0]);
                    imgFd.append('hou', $('#hou').prop('files')[0]);
                    $.ajax({
                        url: "/user/upload",
                        cache: false, //设置为 false 将不会从浏览器缓存中加载请求信息  
                        contentType: false, //(默认: "application/x-www-form-urlencoded") 发送信息至服务器时内容编码类型  
                        processData: false, //默认情况下，发送的数据将被转换为对象(技术上讲并非字符串) 以配合默认内容类型 "application/x-www-form-urlencoded"。如果要发送 DOM 树信息或其它不希望转换的信息，请设置为 false。  
                        dataType: 'json',
                        data: imgFd,
                        type: 'post',
                        timeout: 60000,
                         beforeSend:function(){
                            index;
                         },
                        success: function(data) {
                            
                            if (data.code == 1) {
                                var queryMsg = $("form").serializeArray();
                                queryMsg.push({
                                    'name': 'shang',
                                    'value': data.msg[0]
                                });
                                queryMsg.push({
                                    'name': 'xia',
                                    'value': data.msg[1]
                                });
                                queryMsg.push({
                                    'name': 'zuo',
                                    'value': data.msg[2]
                                });
                                queryMsg.push({
                                    'name': 'you',
                                    'value': data.msg[3]
                                });
                                queryMsg.push({
                                    'name': 'qian',
                                    'value': data.msg[4]
                                });
                                queryMsg.push({
                                    'name': 'hou',
                                    'value': data.msg[5]
                                });
                                $.ajax({
                                    url: "/user/upload/save",
                                    data: queryMsg,
                                    dataType: 'json',
                                    type: 'post',
                                    timeout: 6000,
                                    success: function(id) {
                                        layer.close(index);
                                        if (id.code == 1) {
                                            window.location.href = id.msg;
                                        } else {
                                            layer.msg('上传失败，刷新页面后重试');
                                        }
                                    },
                                    error: function(xhr, err) {
                                        return;
                                        layer.close(index);
                                        layer.msg('系统异常！场景生成失败');
                                        console.log(err);
                                    }
                                });
                            } else {
                                layer.close(index);                                
                                layer.msg('上传失败，刷新页面后重试');
                            }
                        },
                        error: function(xhr, err) {
                            layer.close(index);
                            layer.msg('系统异常！上传失败');
                            console.log(err);
                            return;
                        }
                    })
                } else {
                    layer.msg('您必须上传六张图片')
                }
            } else {
                layer.msg('请输入描述内容');
            }
        } else {
            layer.msg('请输入标题');
        }
    });
});