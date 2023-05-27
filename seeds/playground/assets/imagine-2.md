Everything flows upward, in the same way elements are activated in HTML.
Each element has an input (its children) and presents as an output to its parent.

So, to write down

```
thing one --> thing two --> thing three
```

We write:

```html
<thing-three>
  <thing-two>
    <thing-one></thing-one>
  </thing-two>
</thing-three>
```

This works very well for situations where we have outputs of multiple nodes that converge into one node -- aka a tree:

```html
<ai-completion>
  <ai-memory></ai-memory>
  <ai-input></ai-input>
</ai-completion>
```

But what about situations where we need to have output of the same node to go to more than one node? In this case, we need to use **edges**.

```html
<ai-outer id="one">
  <ai-inner id="two"></ai-inner>
  <ai-inner id="three" to="sideways"></ai-inner>
</ai-outer>
<ai-outer id="four" from="sideways"></ai-outer>
```

What if instead, we used hyperlinks? This would be a way to represent the same graph:

```html
<ai-outer id="one">
  <ai-inner id="two"></ai-inner>
  <ai-inner id="three" href="#four"></ai-inner>
</ai-outer>
<ai-outer id="four"></ai-outer>
```

```html
<ai-outer id="one"></ai-outer>
<ai-inner id="two" href="#one"></ai-inner>
<ai-inner id="three" href="#four #one"></ai-inner>
<ai-outer id="four"></ai-outer>
```

```html
<ai-outer id="one">
  <ai-inner id="two"></ai-inner>
</ai-outer>
<ai-outer id="four">
  <ai-inner id="three" href="#one"></ai-inner>
</ai-outer>
```

Both of the representations result in this graph:

```mermaid
graph TD:
  two --> one;
  three --> one;
  three --> four;
```

The interface `IVertice` is a way to look at an `HTMLElement` as a node in a graph.

The basic idea is that by the time the DOM tree is parsed, the graph is already built. How do we do that?

`IVertice` has N inputs and M outputs, each itself an `IVertice`. The actual element may choose to use or not use these inputs, but they will get wired anyway.

There might be a need for some validation at some point, but I am not sure if `IVertice` is where we'll do it.

In the most normal case, the `connectedCallback` is called in the the order of initialization that we need, so the wiring happens there.

The system should not handle recursion as an error. Infinite loops might be exactly what the developer wants.

The system should automatically identify inputs into the graph and outputs out of the graph. More generally, the system needs to be able to draw the boundary around the graph.

Funny, it seems like this is a neat way to handle graph execution: just use a tree for most cases, and depth-first traversal of DOM to wire it up, and then create additional edges as needed.
