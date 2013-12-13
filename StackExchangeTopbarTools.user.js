// ==UserScript==
// @name Stack Exchange Topbar Tools
// @description A library to support all sorts of tweaks, options, and widgets for the new black topbar.
// @version 0.2-dev
// @namespace michaelb958
// @author michaelb958
// @license MIT (http://opensource.org/licenses/MIT)
// @include http://stackoverflow.com/*
// @include http://serverfault.com/*
// @include http://superuser.com/*
// @include http://meta.stackoverflow.com/*
// @include http://meta.serverfault.com/*
// @include http://meta.superuser.com/*
// @include http://stackapps.com/*
// @include http://*.stackexchange.com/*

// @include http://askubuntu.com/*
// @include http://meta.askubuntu.com/*
// @include http://mathoverflow.net/*
// @include http://meta.mathoverflow.net/*
// @include http://discuss.area51.stackexchange.com/*
// @exclude http://chat.*/*
// ==/UserScript==

// @include http://stackexchange.com/*

function with_jQuery(f) {
    var s = document.createElement("script");
    s.type = "text/javascript";
    s.textContent = "(" + f.toString() + ")(jQuery)";
    s.setAttribute('data-with-jquery', '');
    document.head.appendChild(s);
};

with_jQuery(function($) {
  var tools = null; // set later to StackExchangeTopbarTools
  
  // It's sometimes handy to know what site you're on
  //  Basically, strips leading 'meta.' and trailing anything useless
  var sitename = (function(s) {
    var meta = s.indexOf('meta.') === 0;
    s = meta ? s.substring(5) : s;
    return s.substring(0, s.indexOf('.'));
  })(location.host);
  
  // While some sites can be spaced with either top margin or top
  //  padding, some only work with one or the other.  This variable
  //  accounts for that all-too-common case.  (Margin is used as the
  //  default because that's the only thing that works with beta sites,
  //  and those things are numerous as heck.)
  var spacingAttr = (function(r, d) {
    $.each(d, function(attr, sitestr) {
      $.each(sitestr.split(' '), function(idx, site) {
        r[site] = attr;
      });
    });
    return r;
  })({'': 'margin-top'}, {
    'padding-top': 'cooking stats diy gis english wordpress cstheory apple rpg bicycles android electronics scifi skeptics drupal christianity'
  });
  spacingAttr = spacingAttr[sitename in spacingAttr ? sitename : ''];
  
  var topbar_floating_data = {
    detect: function() { return $('.topbar').css('position') !== 'fixed'; },
    once: $.extend(function() {
      $('.topbar').css({'z-index': 999, 'top': 0});
    }, {
      askubuntu: function() {
        $('#custom-header').css({'top': '0px', 'width': '100%'});
        $('.topbar').css({'top': '30px', 'left': '50%', 'margin-left': '-495px'});
      },
      tex: function() {
        $('body').css('background-image', 'none');
      }
    }),
    on: $.extend(function() {
      $('.topbar').css('position', 'fixed');
      $('.container').css(spacingAttr, '34px');
    }, {
      askubuntu: function() {
        $('#custom-header').css('position', 'fixed');
        $('.topbar').css('margin-left', '-495px');
        $('.container').css(spacingAttr, '62px');
      },
    }),
    off: $.extend(function() {
      $('.topbar').css('position', 'static');
      $('.container').css(spacingAttr, 0);
    }, {
      askubuntu: function() {
        $('#custom-header').css('position', 'static');
        $('.topbar').css('margin-left', 'auto');
      },
    })
  };
  
  var topbar_fullWidth_data = {
    detect: function() { return $('.topbar *.topbar-wrapper').css('width') === '980px'; },
    on: $.extend(function() {
      $('.topbar *.topbar-wrapper').css('width', '100%');
      $('.topbar *.search-container *:last-child').css('margin-right', '2px');
    }, {
      askubuntu: function() {
        // Not supported for aesthetic reasons
        tools.topbar.fullWidth(false);
      },
    }),
    off: $.extend(function() {
      $('.topbar *.topbar-wrapper').css('width', '980px');
      $('.topbar *.search-container *:last-child').css('margin-right', '0');
    }, {})
  };
  
  // ----------------------------------------------------------------------------------------------
  
  $.fn.isAttached = function() {
    // Credit @SLaks <http://stackoverflow.com/a/3086084/1053021>
    return $.contains(document.documentElement, this[0]);
  };
  
  window.StackExchangeTopbarTools = {
    _tick_subscribers: [],
    
    sitename: sitename,
    
    topbar: {
      floating: function(toggle) {
        tools.topbar._styleToggle.call(topbar_floating_data, toggle);
      },
      fullWidth: function(toggle) {
        tools.topbar._styleToggle.call(topbar_fullWidth_data, toggle);
      },
      _styleToggle: function(toggle) {
        var x; // temp var
        if (typeof toggle === 'undefined') toggle = this.detect();
        if (toggle && (x = this.once)) {
          x();
          (x = x[sitename in x ? sitename : '']) ? x() : null;
          this.once = false;
        }
        (x = toggle ? this.on : this.off)();
        (x = x[sitename in x ? sitename : '']) ? x() : null;
      },
      
      color: function(color) {
        $('.topbar').css('background-color', color);
      },
    }, // topbar
    
    links: {
      _defaults: {
        color: false,
      },
      
      append: function() {
        tools.links._add.apply({prepend: false}, arguments);
      },
      prepend: function() {
        tools.links._add.apply({prepend: true}, arguments);
      },
      _add: function() {
        var _ = this;
        $.each(arguments, function(idx, data) {
          if (!data) return true;
          var elem = $('<a />');
          if (data.text)    elem.text(data.text);
          if (data.tooltip) elem.attr('title', data.tooltip);
          
          if (data.id) {
            $('.topbar-menu-links > a').each(function() {
              if ($(this).attr('data-sett-id') == data.id) {
                throw 'StackExchangeTopbarTools.links._add: there already exists a link with ID ' + data.id;
              }
            });
            elem.attr('data-sett-id', data.id);
          } else elem.attr('data-sett-id', '');
          
          if (!(data.href || (data.on && data.on.click))) {
            elem.on('click', false);
          } else {
            if (data.href) {
              elem.attr('href', data.href);
            }
            if (data.on && data.on.click) {
              elem.on('click', function(e) {
                e.preventDefault();
                data.on.click.call(elem, e);
              });
            }
          }
          
          if (data.on) {
            if (data.on.tick) {
              tools._tick_subscribers.push({
                func: data.on.tick,
                elem: elem,
                interval: 'short',
              });
            }
          }
          
          if (tools.links._defaults.color) {
            elem.css('color', tools.links._defaults.color);
          }
          
          elem[_.prepend ? 'prependTo' : 'appendTo']('.topbar-menu-links');
        }); // $.each(arguments, ...)
      }, // links._add
      
      remove: function(id) {
        $('.topbar-menu-links > a[data-sett-id]').each(function() {
          // .links._add doesn't allow duplicate IDs; but plan for them anyway, just to be safe
          if ($(this).attr('data-sett-id') == id) {
            $(this).remove();
          }
        });
      },
      
      color: function(color) {
        $('.topbar-menu-links a, .topbar-flair span').css('color', color);
        tools.links._defaults.color = color;
      },
    }, // links
    
    pluginsReady: function() {
      var initFuncs = [];
      if (arguments.length) {
        initFuncs = initFuncs.slice.call(arguments);
      } else if (typeof StackExchangeTopbarToolsPluginInit !== 'undefined') {
        initFuncs = StackExchangeTopbarToolsPluginInit;
      }
      while (initFuncs.length) {
        initFuncs.shift()(tools);
      }
    },
  };
  
  setInterval(function() {
    // The `* 1000` is to correct for `.getTime()` being in milliseconds and the offset in seconds
    var t = new Date().getTime() + StackExchange.options.serverTimeOffsetSec * 1000;
    $.each(tools._tick_subscribers, function() {
      if (!(this.elem.isAttached())) return true; // link not attached to DOM; do nothing
      if (this.interval === 'short')
        this.func.call($.extend({}, this), new Date(t));
    });
  }, 1000);
  
  $('.topbar *.network-items *.topbar-icon').removeAttr('href');
  $('.topbar *.profile-me').css({'margin-right': '5px', 'padding-right': '0'});
  $('.topbar *.topbar-menu-links').css('margin-left', '0');
  $('.topbar *.search-container *:last-child').css('margin-left', '0');
  
  (tools = window.StackExchangeTopbarTools).pluginsReady();
});
