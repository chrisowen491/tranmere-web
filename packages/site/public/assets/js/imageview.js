import 'magnific-popup';

jQuery(function () {
  $('.lightbox').magnificPopup({
    type: 'image',
    closeOnContentClick: true,
    closeBtnInside: false,
    fixedContentPos: true,
    mainClass: 'mfp-no-margins mfp-with-zoom', // class to remove default margin from left and right side
    image: {
      verticalFit: true
    }
  });

  $('.gallery').each(function () {
    // the containers for all your galleries
    $(this).magnificPopup({
      delegate: '.photo > a', // the selector for gallery item
      type: 'image',
      mainClass: 'mfp-no-margins mfp-with-zoom', // class to remove default margin from left and right side
      gallery: {
        enabled: true
      }
    });
  });
});
