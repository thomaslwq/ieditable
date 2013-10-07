/*
A jquery editable plugin inspired jquery jeditable
*/
(function($){
	$.fn.ieditable = function(target,options){

			var settings = $.extend({}, $.fn.ieditable.defaults, {target:target}, options);
	        
	        /* setup some functions */
	        var plugin   = $.ieditable.types[settings.type].plugin || function() { };
	        var submit   = $.ieditable.types[settings.type].submit || function() { };
	        var buttons  = $.ieditable.types[settings.type].buttons 
	                    || $.ieditable.types['defaults'].buttons;
	        var content  = $.ieditable.types[settings.type].content 
	                    || $.ieditable.types['defaults'].content;
	        var element  = $.ieditable.types[settings.type].element 
	                    || $.ieditable.types['defaults'].element;
	        var reset    = $.ieditable.types[settings.type].reset 
	                    || $.ieditable.types['defaults'].reset;
	        var getContent = $.ieditable.types[settings.type].getContent||function(self){return $(self).val()};

	        var callback = settings.callback || function() { };
	        var onedit   = settings.onedit   || function() { }; 
	        var onsubmit = settings.onsubmit || function() { };
	        var onreset  = settings.onreset  || function() { };
	        var onerror  = settings.onerror  || reset;

	          
	        /* Show tooltip. */
	        if (settings.tooltip) {
	            $(this).attr('title', settings.tooltip);
	        }
	        
	        settings.autowidth  = 'auto' == settings.width;
	        settings.autoheight = 'auto' == settings.height;

	        return this.each(function(){
	        	var self = this;
	        	initComp(self);
	        	initEvent(self);

	        });

		 	function initComp(self){

				var width = $(self).width();
				var height = $(self).height();
	            /* If element is empty add something clickable (if requested) */
	            if (!$.trim($(self).html())) {
	                $(self).html(settings.placeholder);
	            };	
		       /* Show tooltip. */
		        if (settings.tooltip) {
		            $(self).attr('title', settings.tooltip);
		        }
			};
		    function initEvent(self){
			$(self).bind(settings.event,function(e){
				//stop default event and bubble
				e.preventDefault();
				e.stopPropagation();
				//prevent a editable field is clicked again
				if(self.editing){
					return;
				};
                /* Abort if onedit hook returns false. */
                if (false === onedit.apply(this, [settings, self])) {
                   return;
                };
                if(settings.tooltip){

                	$(self).removeAttr('title');
                };
                /* Figure out how wide and tall we are, saved width and height. */
                /* Workaround for http://dev.jquery.com/ticket/2190 */
                if (0 == $(self).width()) {
                    settings.width  = savedwidth;
                    settings.height = savedheight;
                } else {
                    if (settings.width != 'none') {
                        settings.width = 
                            settings.autowidth ? $(self).width()  : settings.width;
                    }
                    if (settings.height != 'none') {
                        settings.height = 
                            settings.autoheight ? $(self).height() : settings.height;
                    }
                };
                /* Remove placeholder text, replace is here because of IE. */
                if ($(self).html().toLowerCase().replace(/(;|"|\/)/g, '') == 
                    settings.placeholder.toLowerCase().replace(/(;|"|\/)/g, '')) {
                        $(self).html('');
                };
                self.editing = true;
                self.revert = getContent(self);
                $(self).html('');

                /*create a form element*/
                var form = $('<form/>');
                /* Apply css or style or both. */
                if (settings.cssclass) {
                    if ('inherit' == settings.cssclass) {
                        form.attr('class', $(self).attr('class'));
                    } else {
                        form.attr('class', settings.cssclass);
                    }
                }

                if (settings.style) {
                    if ('inherit' == settings.style) {
                        form.attr('style', $(self).attr('style'));
                        /* IE needs the second line or display wont be inherited. */
                        form.css('display', $(self).css('display'));                
                    } else {
                        form.attr('style', settings.style);
                    }
                }

                var input  = element.apply(form,[settings,self]);
                var input_content = self.revert;
                //prefill data
                if(settings.data){
                	input_content = settings.data;

                }
                content.apply(form, [input_content, settings, self]);
                input.attr('name',settings.name);
                /* Add buttons to the form. */
                buttons.apply(form, [settings, self]);
         
                /* Add created form to self. */
                $(self).append(form);
         
                /* Attach 3rd party plugin if requested. */
                plugin.apply(form, [settings, self]);                              
                /* Focus to first visible form element. */
                $(':input:visible:enabled:first', form).focus();

                /* Highlight input contents when requested. */
                if (settings.select) {
                    input.select();
                }
        
                /* discard changes if pre ssing esc */
                input.keydown(function(e) {
                    if (e.keyCode == 27) {
                        e.preventDefault();
                        reset.apply(form, [settings, self]);
                    }
                });
                /* fill the content*/
                var blurTimeJob;
                 if ('cancel' == settings.onblur) {
                    input.blur(function(e) {
                        /* Prevent canceling if submit was clicked. */
                        blurTimeJob = setTimeout(function() {
                            reset.apply(form, [settings, self]);
                        }, 500);
                    });
                } else if ('submit' == settings.onblur) {
                    input.blur(function(e) {
                        /* Prevent double submit if submit was clicked. */
                        blurTimeJob = setTimeout(function() {
                            form.submit();
                        }, 200);
                    });
                } else {
                    input.blur(function(e) {
                      /* TODO: maybe something here */
                    });
                };
                    //                   /* Privileged methods */
                self.reset = function(form) {
                    //     /* Prevent calling reset twice when blurring. 
                        if (this.editing) {
                    //         /* Before reset hook, if it returns false abort reseting. */
                            if (false !== onreset.apply(form, [settings, self])) { 
                                $(self).html(self.revert);
                                self.editing   = false;
                                if (!$.trim($(self).html())) {
                                    $(self).html(settings.placeholder);
                                }
                                /* Show tooltip again. */
                                if (settings.tooltip) {
                                    $(self).attr('title', settings.tooltip);                
                                }
                            }                    
                        }
                    }; 
                form.submit(function(e) {

                    if (blurTimeJob) { 
                        clearTimeout(blurTimeJob);
                    }

              //       /* Do no submit. */
                    e.preventDefault(); 

            
              //       /* Call before submit hook. */
              //       /* If it returns false abort submitting. */                    
                    if (false !== onsubmit.apply(form, [settings, self])) { 
                        /* Custom inputs call before submit hook. */
                        /* If it returns false abort submitting. */
                        if (false !== submit.apply(form, [settings, self])) { 

                              /* Add edited content and id of edited element to POST. */
                              var submitdata = {};
                              submitdata[settings.name] = getContent(input);
                              submitdata[settings.id] = self.id;
                              /* Add extra data to be POST:ed. */
                              $.extend(submitdata, settings.submitdata);
                              /* Show the saving indicator. */
                              $(self).html(settings.indicator);
                              /* Defaults for ajaxoptions. */
                              var ajaxoptions = {
                                  type    : 'POST',
                                  data    : submitdata,
                                  dataType: 'html',
                                  url     : settings.target,
                                  success : function(result, status) {
                                      callback.apply(self, [result, settings]);                                  	
                                      if (ajaxoptions.dataType == 'html') {
                                        $(self).html(result);
                                      }
                                      self.editing = false;
                                      if (!$.trim($(self).html())) {
                                          $(self).html(settings.placeholder);
                                      }
                                  },
                                  error : function(xhr, status, error) {
                                      onerror.apply(form, [settings, self, xhr]);
                                  }
                              };
                              
                              /* Override with what is given in settings.ajaxoptions. */
                              $.extend(ajaxoptions, settings.ajaxoptions);   
                              $.ajax(ajaxoptions);          
                              
                           
                        }
                    }
                     /* Show tooltip again. */
                    $(self).attr('title', settings.tooltip);
                    return false;                     

                });    
            })
            };       
	};        
	$.ieditable = {
        types: {
            defaults: {
                element : function(settings, original) {
                    var input = $('<input type="hidden"></input>');                
                    $(this).append(input);
                    return(input);
                },
                content : function(string, settings, original) {
                    $(':input:first', this).val(string);
                },
                reset : function(settings, original) {
                  original.reset(this);
                },
                buttons : function(settings, original) {
                    var form = this;
                    if (settings.submit) {
                        /* If given html string use that. */
                        if (settings.submit.match(/>$/)) {
                            var submit = $(settings.submit).click(function() {
                                if (submit.attr("type") != "submit") {
                                    form.submit();
                                }
                            });
                        /* Otherwise use button with given string as text. */
                        } else {
                            var submit = $('<button type="submit" />');
                            submit.html(settings.submit);                            
                        }
                        $(this).append(submit);
                    }
                    if (settings.cancel) {
                        /* If given html string use that. */
                        if (settings.cancel.match(/>$/)) {
                            var cancel = $(settings.cancel);
                        /* otherwise use button with given string as text */
                        } else {
                            var cancel = $('<button type="cancel" />');
                            cancel.html(settings.cancel);
                        }
                        $(this).append(cancel);

                        $(cancel).click(function(event) {
                            if ($.isFunction($.editable.types[settings.type].reset)) {
                                var reset = $.editable.types[settings.type].reset;                                                                
                            } else {
                                var reset = $.editable.types['defaults'].reset;                                
                            }
                            reset.apply(form, [settings, original]);
                            return false;
                        });
                    }
                }
            },
            text: {
                element : function(settings, original) {
                    var input = $('<input />');
                    if (settings.width  != 'none') { input.attr('width', settings.width);  }
                    if (settings.height != 'none') { input.attr('height', settings.height); }
                     https://bugzilla.mozilla.org/show_bug.cgi?id=236791 
                    //input[0].setAttribute('autocomplete','off');
                    input.attr('autocomplete','off');
                    $(this).append(input);
                    return(input);
                }
            },
            textarea: {
                element : function(settings, original) {
                    var textarea = $('<textarea />');
                    if (settings.rows) {
                        textarea.attr('rows', settings.rows);
                    } else if (settings.height != "none") {
                        textarea.height(settings.height);
                    }
                    if (settings.cols) {
                        textarea.attr('cols', settings.cols);
                    } else if (settings.width != "none") {
                        textarea.width(settings.width);
                    }
                    $(this).append(textarea);
                    return(textarea);
                }
            },
            select: {
               element : function(settings, original) {
                    var select = $('<select />');
                    $(this).append(select);
                    return(select);
                },
                content : function(data, settings, original) {
                    /* If it is string assume it is json. */
                    if (String == data.constructor) {      
                        eval ('var json = ' + data);
                    } else {
                    /* Otherwise assume it is a hash already. */
                        var json = data;
                    }
                    for (var key in json) {
                        if (!json.hasOwnProperty(key)) {
                            continue;
                        }
                        if ('selected' == key) {
                            continue;
                        } 
                        var option = $('<option />').val(key).append(json[key]);
                        $('select', this).append(option);    
                    }                    
                    /* Loop option again to set selected. IE needed this... */ 
                    $('select', this).children().each(function() {
                        if ($(this).val() == json['selected'] || 
                            $(this).text() == $.trim(original.revert)) {
                                $(this).attr('selected', 'selected');
                        }
                    });
                    /* Submit on change if no submit button defined. */
                    if (!settings.submit) {
                        var form = this;
                        $('select', this).change(function() {
                            form.submit();
                        });
                    }
                }
            }
        },

        /* Add new input type */
        addInputType: function(name, input) {
            $.ieditable.types[name] = input;
        }
    };
	/* default settings*/
	$.fn.ieditable.defaults = {
        name       : 'value',
        id         : 'id',
        type       : 'text',
        width      : 'auto',
        height     : 'auto',
        event      : 'click.editable',
        onblur     : 'cancel',
        loadtype   : 'GET',
        loadtext   : 'Loading...',
        placeholder: 'Click to edit',
        loaddata   : {},
        submitdata : {},
        ajaxoptions: {}
	};
})(jQuery)