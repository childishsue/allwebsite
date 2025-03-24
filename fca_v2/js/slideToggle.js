$(document).ready(function () {
    $(".clickContent").click(function () {
        $(this).prev().slideToggle(900);
        if($(this).text()=="開啟")
          $(this).text("關閉");
        else
          $(this).text("開啟");

    });
});

// $(document).ready(function () {
//     $("#clickContent2").click(function () {
//         $("#messageContent2").slideToggle(900);
//     });
// });
