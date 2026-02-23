$(function() {
  $('#mobileMenu_js').hide();
  $('.hamburger').on('click', function() {
    $('#mobileMenu_js').slideToggle();
    $(this).find('i').toggleClass('fa-bars fa-xmark');
  });
  $(window).on('resize', function() {
    if ($(window).width() > 1024) {
      $('#mobileMenu_js').hide();
      $('.hamburger').find('i').removeClass('fa-xmark').addClass('fa-bars');
    }
  });
});