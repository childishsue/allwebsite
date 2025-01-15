(function($){		
	
	if($) {
		
		$(function(){
		
			$('body').append('<div class="page-loader"></div>');
			
			$('body').show();
		});
		
		// The basic check
		if(document.readyState === 'complete') {
			
			$(".page-loader").fadeOut("slow");
		}

		// Polling for the sake of my intern tests
		var interval = setInterval(function() {
			
			if(document.readyState === 'complete') {
				
				$(".page-loader").fadeOut("slow");
				
				clearInterval(interval);
			}    
			
		}, 0);
	}
})(jQuery);
