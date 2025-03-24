$(function(){
    // 會員中心下拉選單
    // $('.link-block-content .icon-arrow').click(function(){
    //     $('.link-block-content .dropDown-block').slideToggle().toggleClass('show');
    // })

    // message.html頁面
    // 無回覆狀態
    $('#no-replay .detail-show').click(function(){
        $('#no-replay .reply-content').slideToggle().addClass('show');
        $('#no-replay .detail-show').removeClass('show');
        $('#no-replay .detail-hidden').addClass('show');
    })
    $('#no-replay .detail-hidden').click(function(){
        $('#no-replay .reply-content').slideToggle().removeClass('show');
        $('#no-replay .detail-hidden').removeClass('show');
        $('#no-replay .detail-show').addClass('show');
    })

    // 已回覆狀態
    $('#replay .detail-show').click(function(){
        $('#replay .reply-content').slideToggle().addClass('show');
        $('#replay .detail-show').removeClass('show');
        $('#replay .detail-hidden').addClass('show');
    })
    $('#replay .detail-hidden').click(function(){
        $('#replay .reply-content').slideToggle().removeClass('show');
        $('#replay .detail-hidden').removeClass('show');
        $('#replay .detail-show').addClass('show');
    })
})
