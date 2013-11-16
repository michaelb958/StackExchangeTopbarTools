# Stack Exchange Topbar Tools 0.1

A JavaScript library for doing all sorts of stuff with the new black Stack Exchange top bar. It's not finished. The cool stuff will be implemented Real Soon Now™.

## Getting Started

All methods are contained within the object `StackExchangeTopbarTools`.

## The links on the RHS

### To add a link:

    StackExchangeTopbarTools.links.append({
      text: 'link text',
      href: 'link target',
      on: {
        click: codeExecutedOnClick,
      },
    })

Use `.links.prepend` instead of `.links.append` to add the link at the start instead of the end.

You cannot use both `.href` and `.on.click` - this would create a bit of an interesting situation regarding what actually happened when you clicked the link, so an exception is thrown if you try to set this situation up.

## Examples

The library currently automatically sets up links to meta/main and chat, as well as links that toggle the floating and full-width aspects of the topbar. These are a sort of test case; they will be removed as soon as I find somewhere else to put them. The code in question can be found between lines 78 and 115 inclusive.
