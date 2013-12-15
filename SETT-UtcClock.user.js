// ==UserScript==
// @name SE Topbar Tools UTC Clock
// @description Never lose track of the official SE time again with this ultra-handy one-second-accuracy topbar clock!
// @version 1.0
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
// @include http://stackexchange.com/*
// @include http://askubuntu.com/*
// @include http://meta.askubuntu.com/*
// @include http://mathoverflow.net/*
// @include http://meta.mathoverflow.net/*
// @include http://discuss.area51.stackexchange.com/*
// @exclude http://chat.*/*
// ==/UserScript==

function with_jQuery(f) {
    var s = document.createElement("script");
    s.type = "text/javascript";
    s.textContent = "(" + f.toString() + ")(jQuery)";
    s.setAttribute('data-with-jquery', '');
    document.head.appendChild(s);
};

with_jQuery(function($) {
  (window.StackExchangeTopbarToolsPluginInit
   = window.StackExchangeTopbarToolsPluginInit
   || []).push(function(tools) {
    
    var getTime = function(time) {
      var zeroPad = function(n) {
        return (n < 10 ? '0' : '') + n;
      };
      var h = zeroPad(time.getUTCHours()),
          m = zeroPad(time.getUTCMinutes()),
          s = zeroPad(time.getUTCSeconds());
      return h + ':' + m + ':' + s;
    };
    tools.links.append({
      id: 'clock',
      text: getTime(new Date()),
      tooltip: 'SE server time ± 6 to 8 seconds',
      on: {
        tick: function(serverTime) {
          this.elem.text(getTime(serverTime));
        },
      },
    });
    
  });
  if (typeof window.StackExchangeTopbarTools === 'object')
    window.StackExchangeTopbarTools.pluginsReady();
});
