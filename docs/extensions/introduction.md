---
description: An introduction to custom Extensions in Directus9.
readTime: 2 min read
---

# Extensions

> In addition to being highly customizable, Directus9 has been architected to be completely modular and extensible. This
> ensures you will never hit a hard feature ceiling within the platform.

Build, modify or expand any feature needed for your app or project. What makes Directus9 so flexible is that it has been
designed from the ground up with complete extensibility. In addition to offering our software's codebase as open-source,
we've broken down the app code into component pieces called Extensions. New Extensions can be created, modified or
expanded to suit any need. However, the following extension types come with the platform's App and API.

## Extension SDK

The easiest way to start creating extensions is to use the [Extensions SDK](/extensions/creating-extensions).

## App Extensions

Allow creating custom experiences within the Directus9 App.

- [Modules](/extensions/modules) — Created with Vue.js
- [Layouts](/extensions/layouts) — Created with Vue.js
- [Interfaces](/extensions/interfaces) — Created with Vue.js
- [Displays](/extensions/displays) — Created with Vue.js
- [Panels](/extensions/panels) — Created with Vue.js
- [Themes](/extensions/themes) — Created with custom CSS

## API Extensions

Allow extending and customizing the data pipeline and platform logic.

- [Endpoints](/extensions/endpoints) — Created with JavaScript / Node.js
- [Hooks](/extensions/hooks) — Created with JavaScript / Node.js
- [Email Templates](/extensions/email-templates) — Created with Liquid.js
- [Migrations](/extensions/migrations) — Created with JavaScript / Node.js

## Hybrid Extensions

Allow adding functionality to the API as well as the App.

- [Operations](/extensions/operations) — Created with Vue.js and JavaScript / Node.js
- [Bundles](/extensions/bundles) — Created with Vue.js and JavaScript / Node.js
