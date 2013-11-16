# Stack Exchange Topbar Tools 0.1

A JavaScript library for doing all sorts of stuff with the new black Stack Exchange top bar. It's not finished. The cool stuff will be implemented Real Soon Now™.

## Getting Started

All methods are contained within the object `StackExchangeTopbarTools`.

## The links on the RHS

### Adding links

<pre>StackExchangeTopbarTools.links.append({
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

### Removing links

<pre>StackExchangeTopbarTools.links.remove(<i>link ID</i>);
</pre>

The link ID is the same one that was used as the `.id` option when the link was added.

## Examples
The library currently automatically sets up a bunch of links to test out functionality. These are a sort of test case; they will be removed as soon as I find somewhere else to put them. The code in question can be found below the hyphens-to-column-80 comment.
