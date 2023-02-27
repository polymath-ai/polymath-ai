# Experimenting with Firebase

Firebase is weird, but in a decent way. The key here is that the typical app hirearchy is a bit inverted. Usually, the main app takes center stage, and the static assets to the side. In Firebase, it's the other way around. The main thing is the static site, and the app itself is a collection of things called `functions`. These functions are basically just node apps that are run on a serverless architecture. The functions are run in response to events, and can be triggered by a variety of things, including HTTP requests, database changes, and scheduled events.

This allows for a very straigthforward architecture: the site is mostly static, with routes being the actual HTML pages. Whenever dynamic content is needed, they make `fetch` requests to the functions, which then do whatever they need to do, and return the result.

Because of this inversion, node modules aren't in the root directory, but are one level deeper, in the `functions` directory. This is because the functions are run in a node environment, and the root directory is not.

The static files are in `public`, which is the root of the static site.

In this particular setup, there is one function that handles all requests, called `api` (see `functions/api.js`).
