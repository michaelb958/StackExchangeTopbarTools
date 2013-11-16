// ==UserScript==
// @name Stack Exchange Topbar Tools
// @description All sorts of tweaks, options, and widgets for the new black topbar.
// @namespace michaelb958
// @author michaelb958
// @license GNU GPL v3 (http://www.gnu.org/copyleft/gpl.html)

// @include http://meta.stackoverflow.com/*

// @exclude http://chat./
// ==/UserScript==

// @include http://stackoverflow.com/*
// @include http://serverfault.com/*
// @include http://superuser.com/*

// @include http://meta.serverfault.com/*
// @include http://meta.superuser.com/*
// @include http://stackapps.com/*
// @include http://*.stackexchange.com/*
// @include http://stackexchange.com/*
// @include http://askubuntu.com/*
// @include http://meta.askubuntu.com/*
// @include http://answers.onstartups.com/*
// @include http://meta.answers.onstartups.com/*
// @include http://mathoverflow.net/*
// @include http://meta.mathoverflow.net/*
// @include http://discuss.area51.stackexchange.com/*

function with_jQuery(f) {
    var s = document.createElement("script");
    s.type = "text/javascript";
    s.textContent = "(" + f.toString() + ")(jQuery)";
    s.setAttribute('data-with-jquery', '');
    document.head.appendChild(s);
};

with_jQuery(function($) {
  StackExchangeTopbarTools = {
    links: {
      append: function() {
        StackExchangeTopbarTools.links._add.apply({prepend: false}, arguments);
      },
      prepend: function() {
        StackExchangeTopbarTools.links._add.apply({prepend: true}, arguments);
      },
      _add: function() {
        var _ = this;
        $.each(arguments, function(idx, data) {
          var elem = $('<a />');
          if (data.text) elem.text(data.text);
          
          if (data.href && data.on && data.on.click) {
            throw "StackExchangeTopbarTools.links.add: can't specify on.click AND href, I'm afraid";
          } else if (data.href) {
            elem.attr('href', data.href);
          } else if (data.on && data.on.click) {
            elem.on('click', function(e) {
              e.preventDefault();
              data.on.click();
            });
          } else {
            elem.on('click', false);
          }
          
          elem[_.prepend ? 'prependTo' : 'appendTo']('.topbar-menu-links');
        });
      },
    },
  };
  
  $('.topbar').css('z-index', 999);
  $('.topbar *.network-items *.topbar-icon').removeAttr('href');
  $('.topbar *.profile-me').css({'margin-right': '5px', 'padding-right': '0'});
  $('.topbar *.topbar-menu-links').css('margin-left', '0');
  $('.topbar *.search-container input[type="text"]:last-child').css('margin-left', '0');
  
  var meta = /^meta\./.test(location.host);
  StackExchangeTopbarTools.links.prepend({
    text: 'chat',
    href: 'http://chat.' + (/stackoverflow\.com$/.test(location.host)
                            ? location.host : 'stackexchange.com'),
  }, {
    text: meta ? 'main' : 'meta',
    href: 'http://' + (meta ? location.hostname.substring(5)
                            : 'meta.' + location.hostname),
  });
  
  StackExchangeTopbarTools.links.append({
    text: 'float',
    on: {
      click: function() {
        if ($('.topbar').css('position') !== 'fixed') {
          $('.topbar').css('position', 'fixed');
          $('.container').css('margin-top', '34px');
        } else {
          $('.topbar').css('position', 'static');
          $('.container').css('margin-top', '0');
        }
      },
    },
  }, {
    text: 'full width',
    on: {
      click: function() {
        if ($('.topbar *.topbar-wrapper').css('width') === '980px') {
          $('.topbar *.topbar-wrapper').css('width', '100%');
          $('.topbar *.search-container input[type="text"]:last-child').css('margin-right', '4px');
        } else {
          $('.topbar *.topbar-wrapper').css('width', '980px');
          $('.topbar *.search-container input[type="text"]:last-child').css('margin-right', '0');
        }
      },
    },
  });
});
