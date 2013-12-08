// ==UserScript==
// @name Stack Exchange Topbar Tools
// @description A library to support all sorts of tweaks, options, and widgets for the new black topbar.
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
  $.fn.isAttached = function() {
    // Credit @SLaks <http://stackoverflow.com/a/3086084/1053021>
    return $.contains(document.documentElement, this[0]);
  };
  
  window.StackExchangeTopbarTools = {
    _tick_subscribers: [],
    
    topbar: {
      floating: function(toggle) {
        if ((typeof toggle === 'undefined' && $('.topbar').css('position') !== 'fixed')
            || toggle) {
          $('.topbar').css('position', 'fixed');
          $('.container').css('margin-top', '34px');
        } else {
          $('.topbar').css('position', 'static');
          $('.container').css('margin-top', '0');
        }
      },
      
      fullWidth: function(toggle) {
        if ((typeof toggle === 'undefined' && $('.topbar *.topbar-wrapper').css('width') === '980px')
            || toggle) {
          $('.topbar *.topbar-wrapper').css('width', '100%');
          $('.topbar *.search-container *:last-child').css('margin-right', '4px');
        } else {
          $('.topbar *.topbar-wrapper').css('width', '980px');
          $('.topbar *.search-container *:last-child').css('margin-right', '0');
        }
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
        StackExchangeTopbarTools.links._add.apply({prepend: false}, arguments);
      },
      prepend: function() {
        StackExchangeTopbarTools.links._add.apply({prepend: true}, arguments);
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
              StackExchangeTopbarTools._tick_subscribers.push({
                func: data.on.tick,
                elem: elem,
                interval: 'short',
              });
            }
          }
          
          if (StackExchangeTopbarTools.links._defaults.color) {
            elem.css('color', StackExchangeTopbarTools.links._defaults.color);
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
        StackExchangeTopbarTools.links._defaults.color = color;
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
        initFuncs.shift()(StackExchangeTopbarTools);
      }
    },
  };
  
  setInterval(function() {
    // The `* 1000` is to correct for `.getTime()` being in milliseconds and the offset in seconds
    var t = new Date().getTime() + StackExchange.options.serverTimeOffsetSec * 1000;
    $.each(StackExchangeTopbarTools._tick_subscribers, function() {
      if (!(this.elem.isAttached())) return true; // link not attached to DOM; do nothing
      if (this.interval === 'short')
        this.func.call($.extend({}, this), new Date(t));
    });
  }, 1000);
  
  $('.topbar').css({'z-index': 999, 'top': 0});
  $('.topbar *.network-items *.topbar-icon').removeAttr('href');
  $('.topbar *.profile-me').css({'margin-right': '5px', 'padding-right': '0'});
  $('.topbar *.topbar-menu-links').css('margin-left', '0');
  $('.topbar *.search-container *:last-child').css('margin-left', '0');
  
  StackExchangeTopbarTools.pluginsReady();
});
