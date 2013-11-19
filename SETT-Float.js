// ==UserScript==
// @name SE Topbar Tools Float by Default
// @description Stick at the top of the viewport where I can see you, darn it!
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
  if (typeof StackExchangeTopbarToolsPluginInit === 'undefined')
    StackExchangeTopbarToolsPluginInit = [];
  StackExchangeTopbarToolsPluginInit.push(function(tools) {
    
    tools.topbar.floating(true);
    
  });
  if (typeof StackExchangeTopbarTools === 'object')
    StackExchangeTopbarTools.pluginsReady();
});
