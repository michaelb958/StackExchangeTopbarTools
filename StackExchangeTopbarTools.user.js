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
// @include http://*.stackoverflow.com/*
// @include http://meta.serverfault.com/*
// @include http://meta.superuser.com/*
// @include http://stackapps.com/*
// @include http://*.stackexchange.com/*

// @include http://askubuntu.com/*
// @include http://meta.askubuntu.com/*
// @include http://mathoverflow.net/*
// @include http://meta.mathoverflow.net/*
// @include http://discuss.area51.stackexchange.com/*
// @exclude http://area51.stackexchange.com/*
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
  var SETT = null; // set later to StackExchangeTopbarTools
  
  // It's sometimes handy to know what site you're on
  //  Basically, strips leading 'meta.' and trailing anything useless
  var sitename = (function(s) {
    var meta = s.indexOf('meta.') === 0;
    s = meta ? s.substring(5) : s;
    return s.substring(0, s.indexOf('.'));
  })(location.host);
  
  // Make the damn bubbles work right
  // CSS copypasta'd from Firebug on $SE_PAGE
  var bubble_css
    = '.topbar *.unread-count {\n'
    + '  border-radius: 2px;\n'
    + '  color: #FFF;\n'
    + '  display: inline-block;\n'
    + "  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif !important;\n"
    + '  font-size: 11px;\n'
    + '  line-height: 1;\n'
    + '  padding: 1px 6px;\n'
    + '  text-indent: 0;\n'
    + '}\n'
    + '.topbar *.topbar-menu-links *.unread-count {\n'
    + '  margin-left: 4px;\n'
    + '}\n'
    ;
  $('<style type="text/css">').text(bubble_css).appendTo(document.head);
  
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
  
  // Have to know how wide the topbar starts out as
  // 980px at the moment, but best to be prepared for change
  var defaultWidth = $('.topbar *.topbar-wrapper').css('width');
  
  // Code for doing stuff with links, split out for reusability
  //  and readability and stuff
  var linkSetup = {
    id: function(id) {
      if (!id) {
        this.attr('data-sett-id', '');
        return;
      }
      if (SETT.links._all().filter(function() {
            return $(this).attr('data-sett-id') == id;
          }).length > 0) {
        throw 'StackExchangeTopbarTools.links._add: there already exists a link with ID ' + id + ', you may not add another';
      }
      this.attr('data-sett-id', id);
    },
    
    click: function(href, on) {
      if (href) {
        this.attr('href', href);
        return;
      }
      if (on && on.click) {
        var _this = this;
        this.on('click', function(e) {
          e.preventDefault();
          on.click.call({elem: _this}, e);
        });
        return;
      }
      // Haven't returned yet, thus nothing noteworthy happens on click
      this.on('click', false);
    },
    
    on: function(on) {
      if (on.click) {
        // Handled in .click
      }
      if (on.tick) {
        SETT._subscribers.tick._short.push({
          func: on.tick,
          elem: this
        });
      }
      if (on.floating) {
        SETT._subscribers.floating.push({
          func: on.floating,
          elem: this
        });
      }
      if (on.fullWidth) {
        SETT._subscribers.fullWidth.push({
          func: on.fullWidth,
          elem: this
        });
      }
    },
    
    unread: function(color) {
      $('<span class="unread-count">')
        .css({backgroundColor: color, display: 'none'})
        .appendTo(this);
    },
    
    modifyMethods: function() {
      var elem = this;
      return {
        text: function(text) { elem.text(text); return this; },
        remove: function()   { elem.remove();   return this; },
        pulse: function(success) {
          var color = success ? 'green' : 'red';
          if (typeof success === 'undefined') color = 'cyan';
          elem.css({transition: 'background-color 150ms linear', backgroundColor: color});
          setTimeout(function() {
            elem.css({transition: '', backgroundColor: ''});
          }, 150);
          return this;
        },
        unread: function(count) {
          var bubble = $('.unread-count', elem);
          if (!bubble.length) {
            linkSetup.unread.call(elem, 'red');
            bubble = $('.unread-count', elem);
          }
          bubble.css('display', count ? 'inline' : 'none')
                .text(count);
          return this;
        }
      };
    }
  };
  
  // Floating is tricky to get right; this is what does it
  var topbar_floating_data = {
    detect: function() {
      return $('.topbar').css('position') !== 'fixed';
    },
    once: $.extend(function() {
      $('.topbar').css({zIndex: 999, top: 0});
    }, {
      askubuntu: function() {
        $('#custom-header').css({top: '0px', width: '100%'});
        $('.topbar').css({top: '30px', left: '50%', marginLeft: '-495px'});
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
        $('.container').css(spacingAttr, '64px');
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
    detect: function() {
      return $('.topbar *.topbar-wrapper').css('width') === defaultWidth;
    },
    once: function() {
      $('.topbar *.topbar-wrapper').css('min-width', defaultWidth);
    },
    on: $.extend(function() {
      $('.topbar *.topbar-wrapper').css('width', '100%');
      $('.topbar *.search-container *:last-child').css('margin-right', '2px');
    }, {
      askubuntu: function() {
        // Not supported for aesthetic reasons
        SETT.topbar.fullWidth(false);
        throw {sett: {abortStyleToggle: true}};
      },
    }),
    off: function() {
      $('.topbar *.topbar-wrapper').css('width', defaultWidth);
      $('.topbar *.search-container *:last-child').css('margin-right', 0);
    }
  };
  
  // ----------------------------------------------------------------------------------------------
  
  $.fn.isAttached = function() {
    // Credit @SLaks <http://stackoverflow.com/a/3086084/1053021>
    return $.contains(document.documentElement, this[0]);
  };
  
  window.StackExchangeTopbarTools = {
    _subscribers: {
      tick: {
        _short: []
      },
      floating: [],
      fullWidth: []
    },
    
    sitename: sitename,
    
    topbar: {
      floating: function toggleTopbarFloating(toggle) {
        var success = SETT.topbar._styleToggle.call(topbar_floating_data, toggle);
        $.each(SETT._subscribers.floating, function() {
          if (!(this.elem.isAttached())) return true; // element not attached to DOM; do nothing
          this.func.call({elem: this.elem, object: this.elem.data('sett-modify-methods')}, success);
        });
        return success;
      },
      
      fullWidth: function toggleTopbarFullWidth(toggle) {
        var success = SETT.topbar._styleToggle.call(topbar_fullWidth_data, toggle);
        $.each(SETT._subscribers.fullWidth, function() {
          if (!(this.elem.isAttached())) return true; // element not attached to DOM; do nothing
          this.func.call({elem: this.elem, object: this.elem.data('sett-modify-methods')}, success);
        });
        return success;
      },
      
      _styleToggle: function(toggle) {
        var x; // temp var
        if (typeof toggle === 'undefined') toggle = this.detect();
        try {
          if ((x = this.once)) {
            x();
            (x = x[sitename in x ? sitename : '']) ? x() : null;
            this.once = false;
          }
          (x = toggle ? this.on : this.off)();
          (x = x[sitename in x ? sitename : '']) ? x() : null;
          return true;
        } catch (e) {
          if (e.sett && e.sett.abortStyleToggle) {
            return false;
          } else throw e;
        }
      },
      
      color: function changeTopbarColor(color) {
        $('.topbar').css('background-color', color);
      },
    }, // topbar
    
    links: $.extend(function getLinkById(id) {
      var link = $('.topbar-menu-links > a[data-sett-id]').filter(function() {
        return $(this).attr('data-sett-id') == id;
      });
      if (link.length > 1) throw "StackExchangeTopbarTools.links.call: you somehow have two links with the same ID, go fix it!";
      return link.data('sett-modify-methods');
    }, {
      _defaults: {
        color: false,
      },
      
      _all: function(container) {
        var x = $('.topbar-menu-links');
        return container ? x : x.find('a');
      },
      _All: function() {
        return SETT.links._all().add('.topbar-flair span');
      },
      
      append: function appendLink() {
        SETT.links._add.apply({prepend: false}, arguments);
      },
      prepend: function prependLink() {
        SETT.links._add.apply({prepend: true}, arguments);
      },
      _add: function() {
        var _ = this;
        $.each(arguments, function(idx, data) {
          if (!data) return true;
          var elem = $('<a />');
          if (data.text)    elem.text(data.text);
          if (data.tooltip) elem.attr('title', data.tooltip);
          
          linkSetup.id.call(elem, data.id);
          linkSetup.click.call(elem, data.href, data.on);
          if (data.on) linkSetup.on.call(elem, data.on);
          if (data.unreadColor) linkSetup.unread.call(elem, data.unreadColor);
          
          if (SETT.links._defaults.color) {
            elem.css('color', SETT.links._defaults.color);
          }
          
          var modifyMethods = linkSetup.modifyMethods.call(elem);
          elem.data('sett-modify-methods', modifyMethods);
          
          elem[_.prepend ? 'prependTo' : 'appendTo'](SETT.links._all(true));
        }); // $.each(arguments, ...)
      }, // links._add
      
      color: function changeLinksColor(color) {
        SETT.links._All.css('color', color);
        SETT.links._defaults.color = color;
      },
    }), // links
    
    pluginsReady: function pluginsReady() {
      var initFuncs = [];
      if (arguments.length) {
        initFuncs = initFuncs.slice.call(arguments);
      } else if (typeof StackExchangeTopbarToolsPluginInit !== 'undefined') {
        initFuncs = StackExchangeTopbarToolsPluginInit;
      }
      while (initFuncs.length) {
        initFuncs.shift()(SETT);
      }
    },
  };
  SETT = window.StackExchangeTopbarTools;
  
  // Corral and configure the built-in links
  (function(links) {
    links.each(function() {
      var elem = $(this), text = $(this).text().trim();
      elem.attr('data-sett-id', text);
      if (text === 'help')
        return true; // Dropdowns will be dealt with later
      elem.text(text)
        .data('sett-modify-methods', linkSetup.modifyMethods.call(elem));
    });
    
    links.filter('[data-sett-id=help]').attr('href', '/help');
    
    $.each({'review': '#E519E5', 'tools': '#F27F0C'}, function(id, color) {
      var link = SETT.links(id);
      if (!link) return true;
      link.unread(0);
      links.filter(function() {
        return $(this).attr('data-sett-id') === id;
      }).children('.unread-count').css('background-color', color);
    });
  })($('.topbar *.topbar-menu-links > a'));
  
  // Set up ticks
  setInterval(function() {
    // The `* 1000` is to correct for `.getTime()` being in milliseconds and the offset in seconds
    var t = new Date().getTime() + StackExchange.options.serverTimeOffsetSec * 1000;
    $.each(SETT._subscribers.tick._short, function() {
      if (!(this.elem.isAttached())) return true; // element not attached to DOM; do nothing
      this.func.call({elem: this.elem, object: this.elem.data('sett-modify-methods')}, new Date(t));
    });
  }, 1000);
  
  $('.topbar *.network-items *.topbar-icon').removeAttr('href');
  $('.topbar *.profile-me').css({marginRight: '5px', paddingRight: 0});
  $('.topbar *.topbar-menu-links').css('margin-left', 0);
  $('.topbar *.search-container *:last-child').css('margin-left', 0);
  if (sitename === 'askubuntu') {
    $('#custom-header').css('margin-bottom', 0);
  }
  
  SETT.pluginsReady();
});
