$(function(){
		
	$(".left-panel>ul>li>a").click(function() {
		if($(this).hasClass("active")){
			$(".left-panel>ul>li>a").removeClass("active");
		}
		else{
		$(".left-panel>ul>li>a").removeClass("active");
		$(this).addClass("active");
		}
	})
});
