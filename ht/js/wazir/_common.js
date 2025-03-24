jQuery.fn.extend({
	onClick: function(func, beforeFunc) {

		beforeFunc = beforeFunc || function(){};

		var tar = this;

		//press enter while focus ont the form triggers click event of submit btn.
		jQuery(tar).closest('form').keypress(function(event){
			if (event.which == 13) {
				jQuery(this).find('.submit').trigger('click');
				return false;
			}
		});

		jQuery(tar).click(function(){

			var form = jQuery(this).closest('form');

			beforeFunc.call(tar);

			jQuery.ajax({
				method: form.attr('method'),
				url:    form.attr('action'),
				data:   form.serialize()
			})
			.done(function( data ) {
				func.call(tar, data);
			});
			return false;
		});
	}
});


function getCredit(force){
	jQuery('.getCredit-js').find('[name]').empty().append('<img class="loading" src="/img/_common/loading.gif">');

	jQuery.ajax({
		method: 'POST',
		url: 'ajax/get_credit',
		data: {  }
	})
	.done(function(re){
		switch(re.code){
			case 0:
				// update credit table
				for(var key in re.data){
					jQuery(document).find('[name=' + key + ']').text(re.data[key]);
				}
				break;

		}
	});
}

function webSocket(auth) {
	var wsServer = auth;
	var websocket = new WebSocket(wsServer);
	var event = ['unread', 'logout'];
	var interval = setInterval(function(){
		for(var i in event){
			websocket.send(JSON.stringify({type: event[i]}));
		}
	}, 5000);
	websocket.onmessage = function(e){

		var data = JSON.parse(e.data);

		switch(data.type){
			case 'logout':
				jQuery.get('/logout');
				swal({ title: "",
				customClass: 'swalPopup' }, function(){
					location = '/logout';
				});
				break;
			case 'unread':
				jQuery('.getUnread-js').text(parseInt(data.data)? data.data: '');
				break;
		}
	};

	websocket.onclose = function(e){
		console.log('Disconnected');
		clearInterval(interval);
		setTimeout(function() { webSocket(auth); }, 3000)
	};
}

jQuery(function(){

	var auth = jQuery('#auth').val();

	if(auth){
		webSocket(auth);
	}

	jQuery('.login_form').find('.submit').onClick(function(data){
		if(data.code){
			swal({title: "", text: data.text,
			customClass: 'swalPopup'});
		}else{
			// location.reload();
			location.href="/member_center";
		}
	});

	jQuery('.fresh-btn').click(function(){
		if(auth){
			getCredit(true);
			return false;
		}
	}).click();

	jQuery('.auth').click(function(){
		if(!auth){
			swal({
				title:"",
				customClass: 'swalPopup'
			});
			return false;
		}

	});
});

jQuery.fn.extend({
	uploadfile: function(init){

		var tar = this;
		var url = init.url;
		var col = init.col || 'col-sm-6';

		var bar = jQuery('<div class="p" style="background-color: aquamarine; height: 3px; width: 0px; margin: 1px"></div>');
		var ctl = jQuery('<input type="file" multiple>');

		jQuery(tar).before(bar);
		jQuery(tar).before(ctl);

		jQuery(ctl).change(function(e){

			var upload = this;
			var data = new FormData();
			var files = jQuery(this).get(0).files;

			for(var i in files){
				data.append(i, files[i]);
			}
			data.append('method', 'upload');

			jQuery.ajax({
				url:  url,
				type: 'POST',
				data: data,
				processData: false, // Don't process the files
				contentType: false, // Set content type to false as jQuery will tell the server its a query string request
				success: function(re){

					var add = JSON.parse(re);
					var val = jQuery(tar).val() || '[]';
					var arr = JSON.parse(val);
					for(var i in add){
						arr.push(add[i]);
					}

					// clear selected files, render gallery
					jQuery(upload).val('');
					jQuery(tar).val(JSON.stringify(arr)).trigger('preset');
				},
				error: function(){
					console.log('err: ajax file upload');
				},
				xhr: function(){
					var xhr = jQuery.ajaxSettings.xhr() ;
					// set the onprogress event handler
					xhr.upload.onprogress = function(evt){
						jQuery(bar).animate({width: (evt.loaded/evt.total*100) + '%'}, 100);
					} ;
					// set the onload event handler
					xhr.upload.onload = function(){
						jQuery(bar).stop().animate({width: '0%'}, 10);
					} ;
					return xhr ;
				}
			});
			return false;
		});

		jQuery(tar).on('preset', function(){

			var val = jQuery(this).val() || '[]';
			var arr = JSON.parse(val);
			var tpl = 100;

			jQuery(this).siblings('div.gallery').remove();

			// init
			if(!arr.length) return;

			var gallery = jQuery('<div class="gallery"><style>.icon-set{ white-space: nowrap; text-overflow: ellipsis; overflow: hidden; position: absolute; bottom: 20px; width: 100%; padding: 5px; background-color: rgba(0,0,0,0.8); color: white} .icon-set a{color: white}</style></div>');

			jQuery(this).after(gallery);

			// bind form reset event
			jQuery(gallery).closest('form').on('reset', function(){
				jQuery(gallery).remove();
			});

			var html = '';
			for(var i in arr){

				arr[i]['ext'] = (arr[i]['name'].split('.')[1] || 'na').toLowerCase();

				var dl = '<a href="' + arr[i]['url'] + '" download="' + arr[i]['name'] + '" target="_blank"><span class="glyphicon glyphicon-download-alt"></span></a>';
				var rm = ' | <a href="#" class="delete"><span class="glyphicon glyphicon-trash"></span></a> ';

				html += '<div style="position: relative; float: left; margin: 10px;"><a class="thumbnail" href="#"><span style="position: absolute; top: 0px; right: 6px; color: black; font-size: 11px;">.' + arr[i]['ext'] + '</span><table style="width: ' + tpl + 'px; height: ' + tpl + 'px;"><tr><td style="padding: 0; text-align: center"><img src="' + arr[i]['url'] + '" class="img-responsive" style="max-width: ' + tpl + 'px; max-height: ' + tpl + 'px; margin: 0 auto;"/></td></tr></table></a>         <div class="icon-set" title="' + arr[i]['name'] + '">' + dl + rm + arr[i]['name'] + '</div></div>';
			}

			// start loading
			jQuery(gallery).append(html);

			jQuery(gallery).find('.thumbnail').each(function(i){

				jQuery(this).imgEvent(jQuery(tar));

				jQuery(this).find('img').on('load', function(){

				}).on('error', function(){
					jQuery(this).addClass('hidden').after('<span class="glyphicon glyphicon-duplicate" style="position: relative; color: brown; font-size: 45px"></span>');
				});
			});
		});
	},
	// delete event
	imgEvent: function(input){

		var tar = this;
		var img = jQuery(tar).find('img');

		jQuery(tar).siblings('.icon-set').find('.delete').click(function(){
			var url = jQuery(img).attr('src');

			var arr = JSON.parse(jQuery(input).val());
			for(var i in arr){
				if(arr[i]['url'] == url){
					arr.splice(i, 1);
					break;
				}
			}

			jQuery(input).val(JSON.stringify(arr));
			jQuery(tar).parent('div').remove();
		});
		return this;
	}
});
