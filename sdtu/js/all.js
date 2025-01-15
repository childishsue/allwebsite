$(function(){
    // 手機版選單打開
    $('nav .mobile-menu').click(function (){
        $('.mobile-link-block').addClass('show');
    })

    // 手機版選單關閉
    $('.mobile-link-block .close-icon').click(function(){
        $('.mobile-link-block').removeClass('show')
    })

    // 桌機版選單打開
    $('nav .web-user-icon .fa-angle-down').click(function (){
        $('.web-link-block').slideToggle().toggleClass('show');
    })

    $('#event .article .click-block').click(function () {
        console.log($(this));
        $(this).next('.drop-down-content').slideToggle().toggleClass('show');
    })
})