// ==UserScript==
// @name SE Topbar Tools Meta/Main+Chat Links
// @description The links to meta (or main, as appropriate) and chat were rather popular; this brings them back.
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
   || []).push(function(SETT) {
    
    var meta = /^meta\./.test(location.host);
    SETT.links.prepend({
      id: 'chat-link',
      text: 'chat',
      href: 'http://chat.' + (/stackoverflow\.com$/.test(location.host)
                              ? location.host : 'stackexchange.com'),
    }, location.host === 'stackapps.com' ? null : {
      id: 'main-meta-link',
      text: meta ? 'main' : 'meta',
      href: 'http://' + (meta ? location.hostname.substring(5)
                              : 'meta.' + location.hostname),
    });
    
  });
  if (typeof window.StackExchangeTopbarTools === 'object')
    window.StackExchangeTopbarTools.pluginsReady();
});
