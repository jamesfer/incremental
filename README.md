# Incremental

This is a proof of concept of a React inspired frontend framework that has a more efficient
rendering engine. It utilises a built in centralised state and index to reduce the amount of work
that needs to be done each update.

A simplified view of React's engine is that whenever `setState` is called or a property changes, it
triggers a component update. This re-calls the component function with any new properties and state
which generates a new virtual DOM to be diffed against the currently displayed DOM. Any changes
detected are applied to the real DOM. This is pretty efficient most of the time, however, there are
some areas that perform some unneeded work. When something in the state changes, React has no way of
knowing what part of the DOM needs to be updated. It has to rebuild the entire virtual DOM tree of 
the component and perform a tree diff. The virtual DOM is many times faster than building an actual
DOM but under heavy updates it can still mean creating many objects that just need to be garbage
collected a few milliseconds later. The tree diff can also be intensive with very large trees so
minimising the amount of DOM that needs to be compared is ideal.

<div align="center">
  <img src="docs/images/react-flow.png" alt="existing react flow">
</div>

This algorithm runs each component function once and builds a structure that knows what parts of the 
component are static and which parts are based on props or state, and more importantly, exactly what
props or state each dynamic part depends on. We can then produce an index that maps paths in the
central state to parts of the component. This means that when a prop changes, it is very fast to
look up exactly which parts of the DOM need to be updated. In addition, the centralised state tree
knows which parts of it have been changed during a update which saves us having to compare it
against its previous state.

<div align="center">
  <img src="docs/images/new-flow.png" alt="new flow">
</div>

## What's the catch?

The way the component index is generated is by wrapping each prop and state value in a special
placeholder. You then write your component in terms of this placeholder as they can then be used to
work out which parts of your component depend on which parts of the state. Here you can see a simple
example of an Incremental component:
```jsx harmony
const blogPost = (props) => {
  const title = get(state, ['title']);    
  const authorName = get(state, ['author', 'name']);
  const content = get(state, ['content']);

  return (
    <div>
      <h1>{title}</h1>
      <h2>By {authorName}</h2>
      <p>{content}</p>
    </div>
  );  
};
```

This gets a little more complex when you want to compute something before rendering it to the screen
because each of the values are just placeholders instead of real values. To access the real values
you need to use the `map()` function. 
```jsx harmony
const blogPost = (props) => {
  const title = get(state, ['title']);    
  const authorName = get(state, ['author', 'name']);
  const content = get(state, ['content']);

  const authorDisplay = map(authorName, name => name == null ? 'Anonymous' : `By ${name}`);

  return (
    <div>
      <h1>{title}</h1>
      <h2>{authorDisplay}</h2>
      <p>{content}</p>
    </div>
  );  
};
```

Depending on how complex your components are, this can add some noise which can make them harder to 
read. Theoretically, this step could be avoided with a clever Babel plugin but that is an experiment
for another day.

## Benchmarks?

All of the advantages I've listed so far have been theoretical, and while my early benchmarking has
backed up my theory, I don't have any concrete benchmarks yet to show how much we save.

## Is it worth it?

Most of the problems with React are not encountered often because it is rare to have an app that
requires heavy updates or very large virtual DOM trees and therefore React performance is often
"good enough". Therefore, this repository will probably forever remain a proof-of-concept.

# Licence

MIT License

Copyright (c) 2019 James Ferguson

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
