jQuery(function () {
    $('.overlay-menu-open').on('click',function(){
      $(this).toggleClass('active');
      $('html').toggleClass('active');
      $('.overlay-menu').toggleClass('active');
    });
});