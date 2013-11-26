# Stack Exchange Topbar Tools 0.1

A JavaScript library for doing all sorts of stuff with the new black Stack Exchange top bar. It's not finished. The cool stuff will be implemented Real Soon Now™.

## Getting Started

All methods supplied by the library are contained within the object `StackExchangeTopbarTools`.

Plugins can make use of the library by simply using the following code template:

<pre>
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
  StackExchangeTopbarToolsPluginInit.push(function(<i>tools</i>) {
    
    // Your plugin code goes here
    // You can refer to the library object by the shorthand <i>tools</i>
    
  });
  if (typeof StackExchangeTopbarTools === 'object')
    StackExchangeTopbarTools.pluginsReady();
});
</pre>

## Attributes of the bar itself

### Background color

<pre>
<i>tools</i>.color(<i>new background color</i>);
</pre>

Supply a string containing any color accepted by CSS (for example, `'#824D07'`).

### Viewport-related stuff

<pre>
<i>tools</i>.topbar.floating(<i>bool</i>);
</pre>

True means float at top of viewport, false means don't. If omitted, changes to whatever it isn't doing now.

<pre>
<i>tools</i>.topbar.fullWidth(<i>bool</i>);
</pre>

True means expand to full width of viewport, false means stay `980px` wide. If omitted, changes to whatever it isn't doing now.

## The links on the RHS

### Adding links

<pre>
<i>tools</i>.links.append({
  id: <i>link ID (not a DOM ID)</i>,
  text: <i>link text</i>,
  tooltip: <i>text to display on mouseover</i>,
  href: <i>navigation target</i>,
  on: {
    click: <i>code executed on click</i>,
    tick: <i>code executed every second</i>,
  },
});
</pre>

Use `links.prepend` instead of `links.append` to add the link at the start instead of the end.

* `.id` is the ID of the link, used internally to refer to that link. No two links may share an ID; this is enforced by code.
* `.text` is the human-readable text of the link.
* `.tooltip` is the text displayed in that tooltip thing that appears when you mouse over the link. Implemented using the HTML `title` attribute.
* `.href` is the target of the link (that is, where you go when the link is clicked).
* `.on` contains event-handling functions:
    * `.on.click` is executed when the link is clicked. If specified, this overrides `.href` on a left-click (think `e.preventDefault()`).
    * `.on.tick` is executed every second. This can be useful, say, for updating a clock.

#### WARNING: Prepending links

`links.prepend` behaves kinda counterintuitively when passed multiple arguments - when all's said and done, the extra links appear in reverse order (that is, the last argument to `links.prepend` becomes the first link on the RHS).

### Removing links

<pre>
<i>tools</i>.links.remove(<i>link ID</i>);
</pre>

The link ID is the same one that was used as the `.id` option when the link was added.

### Changing link color globally

<pre>
<i>tools</i>.links.color(<i>new foreground color</i>);
</pre>

Supply a string containing any color accepted by CSS (for example, `'#26D8D8'`).
