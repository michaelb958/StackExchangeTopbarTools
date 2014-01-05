// ==UserScript==
// @name SE Topbar Tools Float by Default
// @description Stick at the top of the viewport where I can see you, darn it!
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
    
    SETT.topbar.floating(true);
    
  });
  if (typeof window.StackExchangeTopbarTools === 'object')
    window.StackExchangeTopbarTools.pluginsReady();
});
