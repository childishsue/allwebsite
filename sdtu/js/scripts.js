if($){
	
	$(function() {
		
		var deviceWidth = window.innerWidth > 0 ? window.innerWidth : screen.width,
			deviceHeight = window.innerHeight > 0 ? window.innerHeight : screen.height;
			
		$(window).bind("load resize", function() {
		
			deviceWidth = (this.window.innerWidth > 0) ? this.window.innerWidth : this.screen.width;
			deviceHeight = (this.window.innerHeight > 0) ? this.window.innerHeight : this.screen.height;
			
			if (deviceWidth < 500) {
				
				var maxHeight = $('.fix-active').height(),
					defaultHeight =  -1 * (maxHeight - 50);
				
				$('.fix-active').css('bottom',  defaultHeight);
				
				$('.fix-active').click(function(){
					
					if($(this).hasClass('mobile-active')) {
						
						$(this).removeAttr('style');
					}
					else {
						
						$('.fix-active').css('bottom',  defaultHeight);
					}
				});
			}
		});
		
		$(".fix-left").css("top", $(window).scrollTop() + $(window).height() / 2.5);
		
		$(window).scroll(function() {
			
			$(".fix-left").css("top", $(window).scrollTop() + $(window).height() / 2.5);
		})

		$(".navbar-toggle2").click(function() {
			if ($(".login").hasClass("active")) {
				$(".login").removeClass("active")
			} else {
				$(".login").addClass("active");
				if($(".navbar-toggle:not(.navbar-toggle2)").hasClass("collapsed")==false){
					$(".navbar-toggle:not(.navbar-toggle2)").click();
					$(".login").addClass("active");
				}
			}
		});
		
		$(".navbar-toggle:not(.navbar-toggle2)").click(function(){
			if ($(".login").hasClass("active")) {
				$(".login").removeClass("active")
			} 
		});
		
		$(".fix-left-shrink").click(function() {
			$(".fix-active").removeClass("active");
		});
		
		$(".fix-shirk-section").click(function(){
			$(".fix-active").addClass("active");
		})

		$(".fix-phone-icon-title").click(function() {
			if ($(".fix-active").hasClass("mobile-active")) {
				$(".fix-active").removeClass("mobile-active")
			} else {
				$(".fix-active").addClass("mobile-active");
			   
			}
		});
	});
}
