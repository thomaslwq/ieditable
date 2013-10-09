/*
<<<<<<< HEAD
 * 
a multichoice component,depend on select2.js
=======
 * a multiselect plugin depend on select2.js
>>>>>>> a29096625d12989f83be96319a5a53e291c617be
 */
 $.ieditable.addInputType('multiselect',{
    element : function(settings, original) {
        var div = $('<input style="width:50%"/>');
        if (settings.width  != 'none') { div.attr('width', settings.width);  }
        if (settings.height != 'none') { div.attr('height', settings.height); }
        /* https://bugzilla.mozilla.org/show_bug.cgi?id=236791 */
        //input[0].setAttribute('autocomplete','off');
        $(this).append(div);
        return(div);
    },
    content : function(string, settings, original) {
        $(this).find("input:first").val(string);
    },
    //添加第三方插件wysiwyg的 支持
    plugin:function(settings,original){
    	var self = original;
    	var select_input = $(original).find('input:first');
    	var search_url = '';
			select_input.select2({
						minimumInputLength: 2,			
						multiple: settings.multiple||false,
					    initSelection : function (element, callback) {
						if(settings.init){
							var init = settings.init;
							var init_data = init.init_data||'';
							var init_url = init.init_url||'';
							var init_callback = init.init_callback||function(){};
							var init_params = init.init_params||'';
							if(init_params){
								search_url = init_params.search_url;
							}
							
							if(init_data){
								select_input.select2('val',init_data);
							}else{
						    	 $.ajax({
						            type:'get',
						            url: init_url,
						            data: init_params,
						            dataType: 'json',
						            success: function(data) {
										init_callback(data,callback)
									}
						        });				
							}
						}else{					    	
					        var data = [];
					        $(element.val().split(",")).each(function () {
					            data.push({id: this, text: this});
					        });
					        callback(data);
						}
						select_input.on('select2-blur',function(e){
				                              var submitdata = {};
				                              if(settings.multiple)
				                              {
						                           var   input_values= select_input.select2('val');                                   
						                            submitdata[settings.name] = input_values.join(",");
				                              }else{
					                              submitdata[settings.name] = select_input.select2('val');                              
				                              }
				
				                              submitdata[settings.id] = self.id;
				                              /* Add extra data to be POST:ed. */
				                              if ($.isFunction(settings.submitdata)) {
				                                  $.extend(submitdata, settings.submitdata.apply(self, [self.revert, settings]));
				                              } else {
				                                  $.extend(submitdata, settings.submitdata);
				                              }
				
				                              /* Quick and dirty PUT support. */
				                              if ('PUT' == settings.method) {
				                                  submitdata['_method'] = 'put';
				                              }
				
				                              /* Show the saving indicator. */
				                              $(self).html(settings.indicator);
				                              
				                              /* Defaults for ajaxoptions. */
				                              var callback = settings.callback||function(){};
				                              var ajaxoptions = {
				                                  type    : 'POST',
				                                  data    : submitdata,
				                                  dataType: 'html',
				                                  url     : settings.target,
				                                  success : function(result, status) {
				                                      if (ajaxoptions.dataType == 'html') {
				                                        $(self).html(result);
				                                      }
				                                      self.editing = false;
				                                      callback.apply(self, [result, settings]);
				                                      if (!$.trim($(self).html())) {
				                                          $(self).html(settings.placeholder);
				                                      }
				                                  },
				                                  error   : function(xhr, status, error) {
													if(settings.onerror){
													
														settings.onerror.apply(original, [settings, self, xhr]);
													
													}else{
														alert('responseText:'+xhr.responseText+' status:'+status);
													}
				                                      
				                                  }
				                              };
				                              
				                              /* Override with what is given in settings.ajaxoptions. */
				                              $.extend(ajaxoptions, settings.ajaxoptions);   
				                              $.ajax(ajaxoptions); 			
						
							
						});						
					    },					
			            query: function (query) {
							    	 $.ajax({
							            type:'get',
							            url: search_url,
							            data:  {
												'query_name' : query.term
											},
							            dataType: 'json',
							            success: function(data) {
												var data = data.data;
												var queryData = {results: []}
												var len = data.length;
												var options = '';
												for (var i = 0; i < len; i++) {
													queryData.results.push({id:data[i]['id'] , text: data[i]['text']});
												}
												query.callback(queryData);
											},
										error   : function(xhr, status, error) {
													if(settings.onerror){
													
														settings.onerror.apply(original, [settings, self, xhr]);
													
													}else{
														alert('responseText:'+xhr.responseText+' status:'+status);
													}
				                                      
				                                  }
							        });			            	
			            }		 
			});
//填充编辑时的初始化数据
			

			
//		var members_data = {
//			members_cn_names:$(original).attr('members_cn_names'),
//			members_en_names:$(original).attr('members_en_names'),			
//		};
//		select_input.select2('val',members_data);
		
//		select_input.bind('select2-close',function(e){
//			$(original).html(self.revert);
//			
//		});

    	
    },
    /*阻止jieditor自己默认的提交*/
    onsubmit:function(){
    	return false;
    }
 })
