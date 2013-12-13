// ==UserScript==
// @name SE Topbar Tools Basic Config
// @description Adds topbar links to toggle full-width and viewport-floating.
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
    
    tools.links.append({
      id: 'float-topbar-toggle',
      text: 'float',
      tooltip: 'attach topbar to top of viewport (click again to undo)',
      on: {
        click: function() {
          tools.topbar.floating();
        },
      },
    }, {
      id: 'full-width-toggle',
      text: 'full width',
      tooltip: 'widen topbar to full width of viewport (click again to undo)',
      on: {
        click: function() {
          tools.topbar.fullWidth();
        },
      },
    });
    
  });
  if (typeof window.StackExchangeTopbarTools === 'object')
    window.StackExchangeTopbarTools.pluginsReady();
});
