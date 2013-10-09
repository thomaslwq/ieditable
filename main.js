$(document).ready(function(){
	
	  $('#edit_input').ieditable('testdata/saveurl.json', {
            type: 'multiselect',
            multiple:false,
            indicator: '正在保存...',
            onblur: 'submit',
            ajaxoptions: {
            	dataType: 'json'
            },
            init:{
               init_url:'testdata/multiselect.json',
               //返回结果的json数据
               init_callback:function(data,system_callback){
               	 //处理后台传来的数据，转成[{id:123,text:123}]的形式
               	if(data['success'])
               	{
					
               		
	               	var returnData = {id:"text",text:"text"}

	               	system_callback(returnData);	               		
               	}else{
               		alert('网络连接超时');
               	}
               },
			   
               init_params:{
				search_url:'testdata/multiselect.json'
//                   id:id
               }
            },           
            submitdata: {
				// id:id
            },
            style: 'display: inline;width:50px',
            callback: function(data, settings){
            	if(data['success'])
            	{
                $(this).html("修改成功");
            	}else{
            		alert('网络连接超时：'+data.msg);
            	}
            }
       })
	
});