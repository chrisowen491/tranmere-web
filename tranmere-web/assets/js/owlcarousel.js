import "owl.carousel";

jQuery(function () {
    $('.owl-carousel').each(function() {
        var a = $(this),
        items = a.data('items') || [1,1,1,1],
        margin = a.data('margin'),
        loop = a.data('loop'),
        nav = a.data('nav'),
        dots = a.data('dots'),
        center = a.data('center'),
        autoplay = a.data('autoplay'),
        autoplaySpeed = a.data('autoplay-speed'),
        rtl = a.data('rtl'),
        autoheight = a.data('autoheight');

        var options = {
            nav: nav || false,
            loop: loop || false,
            dots: dots || false,
            center: center || false,
            autoplay: autoplay || false,
            autoHeight: autoheight || false,
            rtl: rtl || false,
            margin: margin || 0,
            autoplayTimeout: autoplaySpeed || 3000,
            autoplaySpeed: 400,
            autoplayHoverPause: true,
            responsive: {
                0: { items: items[3] || 1 },
                992: { items: items[2] || 1 },
                1200: { items: items[1] || 1 },
                1600: { items: items[0] || 1}
            }
        };

        a.owlCarousel(options);

        // Custom Navigation Events
        $(document).on('click', '.owl-item>div', function() {
            $owl.trigger('to.owl.carousel', $(this).data( 'position' ) );
        })
    })
});