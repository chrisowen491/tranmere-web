jQuery(function () {
  var folder = $('.file-tree li.file-tree-folder'),
    file = $('.file-tree li');
  folder.on('click', function (a) {
    $(this)
      .children('ul')
      .slideToggle(400, function () {
        $(this).parent('li').toggleClass('open');
      }),
      a.stopPropagation();
  });

  file.on('click', function (b) {
    b.stopPropagation();
  });
});
