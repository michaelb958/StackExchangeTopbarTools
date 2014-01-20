// ==UserScript==
// @name Stack Exchange Topbar Tools
// @description A library to support all sorts of tweaks, options, and widgets for the new black topbar.
// @version 0.2
// @namespace michaelb958
// @author michaelb958
// @license MIT (http://opensource.org/licenses/MIT)
// @include /^https?:\/\/(.*\.)?(?:(?:stack(?:apps|exchange|overflow)|superuser|serverfault|askubuntu)\.com|mathoverflow\.net)\/.*/
// @exclude /^https?:\/\/(?:(?:api|area51)\.)?stackexchange\.com\/.*/
// @exclude /^https?:\/\/(?:chat|blog)\..+/
// ==/UserScript==

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
  
  function TopbarLink(elem) {
    this.text = function setText(text) {
      elem.text(text); return this;
    };
    this.remove = function removeLink() {
      elem.remove(); return this;
    };
    this.pulse = function pulseLink(success) {
      var color = success ? 'green' : 'red';
      if (typeof success === 'undefined') color = 'cyan';
      elem.css({transition: 'background-color 150ms linear', backgroundColor: color});
      setTimeout(function() {
        elem.css({transition: '', backgroundColor: ''});
      }, 150);
      return this;
    };
    this.unread = function setUnreadCounter(count) {
      var bubble = $('.unread-count', elem);
      if (!bubble.length) {
        linkSetup.unread.call(elem, 'red');
        bubble = $('.unread-count', elem);
      }
      bubble.css('display', count ? 'inline' : 'none')
            .text(count.toString());
      return this;
    };
  };
  
  // Code for doing stuff with links, split out for reusability
  //  and readability and stuff
  var linkSetup = {
    id: function(id) {
      if (!id) {
        this.attr('data-sett-id', '');
        return;
      }
      if (allLinks().filter(function() {
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
        subscribers.tick._short.push({
          func: on.tick,
          elem: this
        });
      }
      if (on.floating) {
        subscribers.floating.push({
          func: on.floating,
          elem: this
        });
      }
      if (on.fullWidth) {
        subscribers.fullWidth.push({
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
      return new TopbarLink(this);
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
        $('#custom-header *.nav-global ul > li ul').css('top', '64px');
      },
    }),
    off: $.extend(function() {
      $('.topbar').css('position', 'static');
      $('.container').css(spacingAttr, 0);
    }, {
      askubuntu: function() {
        $('#custom-header').css('position', 'static');
        $('.topbar').css('margin-left', 'auto');
        $('#custom-header *.nav-global ul > li ul').css('top', '30px');
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
  
  var subscribers = {
    tick: {
      _short: []
    },
    floating: [],
    fullWidth: []
  };
  var doSubscribers = function(subs, argsFunc) {
    // Note on argsFunc: The function wrapper around the array is
    //  necessary so that said array is regenerated fresh for each
    //  application, so as to prevent malicious plugins modifying stuff
    //  within it - for example, tick subscribers get a Date, which
    //  could be modified.  (Also, arrow functions are sorely needed
    //  here - writing `function(){return [foo, bar];}` is a pain
    //  compared to `() => [foo, bar]`.  They're not widely available
    //  yet, unfortunately.)
    $.each(subs, function() {
      if (!(this.elem.isAttached())) return true; // element not attached to DOM; do nothing
      this.func.apply({elem: this.elem, object: this.elem.data('sett-modify-methods')}, argsFunc());
    });
  };
  
  var topbarStyleToggle = function(toggle) {
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
  };
  
  var linkDefaults = {
    color: false
  }, linksContainer = function() {
    return $('.topbar-menu-links');
  }, allLinks = function() {
    return linksContainer().find('a');
  }, allLinksPlusUserSpans = function() {
    return allLinks().add('.topbar-flair span');
  };
  
  var addLinks = function() {
    var elems = $();
    $.each(arguments, function(idx, data) {
      if (!data) return true;
      var elem = $('<a />');
      if (data.text)    elem.text(data.text);
      if (data.tooltip) elem.attr('title', data.tooltip);
      
      linkSetup.id.call(elem, data.id);
      linkSetup.click.call(elem, data.href, data.on);
      if (data.on) linkSetup.on.call(elem, data.on);
      if (data.unreadColor) linkSetup.unread.call(elem, data.unreadColor);
      
      if (linkDefaults.color) {
        elem.css('color', linkDefaults.color);
      }
      
      var modifyMethods = linkSetup.modifyMethods.call(elem);
      elem.data('sett-modify-methods', modifyMethods);
      
      // Do not remove this assignment to `elems`.  The code will
      //  break, and you will regret it.  ($().add() doesn't modify
      //  the existing jQuery object - it creates a new one.)
      elems = elems.add(elem);
    }); // $.each(arguments, ...)
    var action = this.prepend ? 'prependTo' : 'appendTo';
    elems[action](linksContainer());
  };
  
  // ----------------------------------------------------------------------------------------------
  
  $.fn.isAttached = function() {
    // Credit @SLaks <http://stackoverflow.com/a/3086084/1053021>
    return $.contains(document.documentElement, this[0]);
  };
  
  SETT = window.StackExchangeTopbarTools
       = new function StackExchangeTopbarTools() {
    this.sitename = sitename;
    
    this.topbar = new function Topbar() {
      this.floating = function toggleTopbarFloating(toggle) {
        var success = topbarStyleToggle.call(topbar_floating_data, toggle);
        doSubscribers(subscribers.floating, function(){return [success];});
        return success;
      };
      
      this.fullWidth = function toggleTopbarFullWidth(toggle) {
        var success = topbarStyleToggle.call(topbar_fullWidth_data, toggle);
        doSubscribers(subscribers.fullWidth, function(){return [success];});
        return success;
      };
      
      this.color = function changeTopbarColor(color) {
        $('.topbar').css('background-color', color);
      };
    };
    
    this.links = function getLinkById(id) {
      var link = $('.topbar-menu-links > a[data-sett-id]').filter(function() {
        return $(this).attr('data-sett-id') == id;
      });
      if (link.length > 1) throw "StackExchangeTopbarTools.links.call: you somehow have two links with the same ID, go fix it!";
      return link.data('sett-modify-methods');
    };
    
    this.links.append = function appendLinks() {
      addLinks.apply({prepend: false}, arguments);
    };
    
    this.links.prepend = function prependLinks() {
      addLinks.apply({prepend: true}, arguments);
    };
    
    this.links.color = function changeLinksColor(color) {
      allLinksPlusUserSpans().css('color', color);
      linkDefaults.color = color;
    };
    
    this.pluginsReady = function pluginsReady() {
      var initFuncs = [];
      if (arguments.length) {
        initFuncs = initFuncs.slice.call(arguments);
      } else if (typeof StackExchangeTopbarToolsPluginInit !== 'undefined') {
        initFuncs = StackExchangeTopbarToolsPluginInit;
      }
      while (initFuncs.length) {
        initFuncs.shift()(SETT);
      }
    };
  };
  
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
    doSubscribers(subscribers.tick._short, function(){return [new Date(t)];});
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
