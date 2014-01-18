// ==UserScript==
// @name SE Topbar Tools Meta/Main+Chat Links
// @description The links to meta (or main, as appropriate) and chat were rather popular; this brings them back.
// @namespace michaelb958
// @author michaelb958
// @license MIT (http://opensource.org/licenses/MIT)
// @include /^https?:\/\/.*(?:(?:stack(?:apps|exchange|overflow)|superuser|serverfault|askubuntu)\.com|mathoverflow\.net)\/.*/
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
    
    var a51 = /^(discuss\.)?area51/.test(location.host),
        meta = /^(?:discuss|meta)\./.test(location.host);
    var mainMetaHost = meta
                     ? location.hostname.substring(a51 ? 8 : 5)
                     : (a51 ? 'discuss.' : 'meta.') + location.hostname;
    SETT.links.prepend(location.host === 'stackapps.com' ? null : {
      id: 'main-meta-link',
      text: meta ? 'main' : a51 ? 'discuss' : 'meta',
      href: 'http://' + mainMetaHost
    }, {
      id: 'chat-link',
      text: 'chat',
      href: 'http://chat.' + (/stackoverflow\.com$/.test(location.host)
                              ? location.host : 'stackexchange.com')
    });
    
  });
  if (typeof window.StackExchangeTopbarTools === 'object')
    window.StackExchangeTopbarTools.pluginsReady();
});
