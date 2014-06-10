# Style Guide

Most of these rules have been taken from or based upon SMACSS: http://smacss.com/book/

## General Rules

- Never type a hex or decimal value more than once; everything should be a variable ( defined in base/_config.scss ).
- All selectors are comma separated and on their own line.
- Sets are definitions are indented with four spaces.
- All receive their own line, with a space after the colon. ( i.e. color: #123456; )
- Group and order definitions according to the following: box, border, background, text, other
- Vendor-specific definitions always go before their general definition.
- Always use rem-calc ( or a similar method ) instead of direct values; 0 can be entered as a simple value.
- Avoid unnecessarily long selectors ( anything over 4 levels is probably wrong ). 

```
.some-selector,
.another-selector {
    display: inline-block;
    margin: 0;
    padding: rem-calc(5) rem-calc(10);

    border: 1px solid $primary-color;
    -moz-border-radius: rem-calc(8);
    -webkit-border-radius: rem-calc(8);
    border-radius: rem-calc(8);

    background: $secondary-color;

    color: $primary-color;

    text-align: center;
    line-height: rem-calc(20);
    font-size: rem-calc(20);
}
```

## Directory Structure

Your SCSS should either be in these files, or an extension of these files in src/styles/:

```
_base.scss
_layout.scss
_module.scss
_state.scss
_theme.scss
```

### Base

- Only styles that won't be frequently overwritten ( except normalize ).
- For example: _* { box-sizing: border-box; }_
- Broad element styling for a base "theme" - i.e. a { color: #369; }

### Layout

- Define the position of broadly used template elements.  i.e. header, footer, etc.
- These should be defined using an ID: #header, #footer, etc.
- Avoid using base containers to wrap everything, use margins instead.
- Class items together when possible.
- It's OK to put tighter selectors on ID elements to define alternative layouts ( i.e. .thin-viewport #header ).
- Avoid using mixins for Foundation classes if you can get away with classing the DOM.

```
<header id="page-header" class="row">
	<div id="left-bar" class="small-12 medium-6 large-6"></div>
	<div id="right-bar" class="small-12 medium-6 large-6"></div>
</header>
```

```
#page-header,
#page-footer {
	margin: 0 auto;
}

#left-bar,
#right-bar {
	margin: 0;
	padding: rem-calc(20);
}

#left-bar {
	float: left;
}

#right-bar {
	float: right;
}

.flipped-view #left-bar {
	float: right;
}

.flipped-view #right-bar {
	float: left;
}
```

### Modules

Modules represent unique visual elements within your pages.  These can be a gallery, navigation links, lists, etc.

- Modules should be classed only when necessary, and should avoid classing when an element will be used consistently instead.
- Sub-class the module by it's parent only when necessary.
- Try to define all values by % of parent when possible ( i.e. width, etc. )
- Classes should cascade the module name to clearly delineate ownership.
- Modules should be imported into _module.scss and stored in a file matching their own name ( i.e. module/_button.scss ).

```
.example {
	width: 100%;
	padding: rem-calc(20);
}

.example > h1 {
	font-size: rem-calc(40);
}

/*
 * Two p classes that are named in the correct namespace.
 */

.example-something {
	color: $primary-color;
}

.example-anotherthing {
	color: $secondary-color;
}

/*
 * If you needed a special case of example to be large, you chain the selector.
 */
.example.example-large {
	width: 80%;
}

```

### State

State values generally delineate a change that Javascript has or will change.

- These start with "is-" and then define the state, i.e. "is-hidden"
- If an animation describes the state, include it in the name, i.e. "is-collapsed", "is-expanded"
- You can use !important on these as they generally will be a hard override, but watch for transition appropriateness.
- If tied to a specific module, include the name of the module, i.e. "is-example-hidden"
- All state changes should be animated by CSS whenever possible ( i.e. Javascript should only add or remove classes ).
- Try to affect entire modules at once, rather than elements within a module.

```
/*
 * In module/_button.scss
 */

.button {
	background: $primary-color;
}

/*
 * In state/_button.scss
 */

.is-button-active {
	background: $secondary-color;
}

```

### Theme

