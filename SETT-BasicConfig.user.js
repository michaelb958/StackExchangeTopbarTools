// ==UserScript==
// @name SE Topbar Tools Basic Config
// @description Adds topbar links to toggle full-width and viewport-floating.
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
    
    SETT.links.append({
      id: 'float-topbar-toggle',
      text: 'float',
      tooltip: 'attach topbar to top of viewport (click again to undo)',
      on: {
        click: function() {
          SETT.topbar.floating();
        },
        floating: function(success) {
          this.object.pulse(success);
        }
      }
    }, {
      id: 'full-width-toggle',
      text: 'full width',
      tooltip: 'widen topbar to full width of viewport (click again to undo)',
      on: {
        click: function() {
          SETT.topbar.fullWidth();
        },
        fullWidth: function(success) {
          this.object.pulse(success);
        }
      }
    });
    
  });
  if (typeof window.StackExchangeTopbarTools === 'object')
    window.StackExchangeTopbarTools.pluginsReady();
});
