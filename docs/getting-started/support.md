---
description: How to get support for your Directus project.
readTime: 4 min read
---

# Help & Support

> If you have questions while working with Directus, there are many resources to help you get up-and-running smoothly.

## Troubleshooting Steps

If you're experiencing issues or think you have found a problem in Directus, be sure to follow these steps before
[Reporting a Bug](/contributing/introduction#bug-reporting):

1. Ensure your server and database meet the [minimum requirements](/self-hosted/docker-guide.html#supported-databases).
2. Ensure you’re on the [latest version](https://github.com/LaWebcapsule/directus9/releases/latest) of Directus.
3. Stop `CTRL+C` and restart the server `npx directus start`.
4. Run the database migration script: `directus database migrate:latest`\
   _Note: backup your database first._
5. Disable any data-caching within your project.
6. Test any app issues with both browser extensions and caching disabled _(i.e. Incognito Mode)_.
7. Confirm the issue is not related to your own custom code.
8. Check for [existing Issues](https://github.com/LaWebcapsule/directus9/issues?q=is%3Aissue) (and
   [Discussions](https://github.com/LaWebcapsule/directus9/discussions)) that match your problem.

If you're still experiencing a problem after completing the above steps, you can chat through things on our
[community support](#community-support) or [report a bug](/contributing/introduction#bug-reporting).

## Support Tiers

### Community Support

[GitHub Discussions](https://github.com/LaWebcapsule/directus9/discussions) is a great first place to reach out for help. Our
community and core developers often check this platform and answer posts. It has the added benefit of being an archival
resource for others developers with similar questions.

Our [Discord Community](https://directus.chat) is another great way to get assistance. Please keep all questions in the
help channels, be considerate, and remember that you are getting free help from the community.

:::warning No Guaranteed Response Time

While the Directus Core Team plays an active and engaged role in community discussions, there is no guaranteed response
time for Community Support.

:::

### Basic and Premium Support

Basic and Premium Support offer direct communication with the Directus Core Team. Basic support is included on all
Enterprise Projects, and Premium Support adds 24/7 response times for critical software issues only.

Cloud customers and Self-Hosted users interested in learning more about our monthly retainer agreements should contact
us at [support@directus.io](mailto:support@directus.io).

## Sponsored Work

### Commissioned Features

If you need a specific feature added to Directus faster than the normal development timeline,
[reach out to us](https://directus.io/contact) for a quote. Our parent agency will often help subsidize the cost of
developing new features if they pass our [80/20 Rule](/contributing/introduction#feature-requests) and can be merged
into the core codebase. Other custom/proprietary development will be built bespoke within our robust extension system.

### Expedited Fixes

We triage all reported bugs based on priority and how long the fix is estimated to take. If you need a specific issue
resolved sooner, [reach out to us](https://directus.io/contact) for a quote.

## Frequently Asked Questions

### Does Directus support Mongo/NoSQL?

Not currently. Directus has been built specifically for wrapping _relational_ databases. While we could force Mongo to
use tables, columns, and rows via Mongoose object modeling, that approach of "faking" a relational structure in a
non-structured environment like Mongo doesn't make a lot of sense. We do realize many users are interested in this
feature, and will continue to explore its possibility.

### Why haven't you added this feature, or fixed that issue yet?

Directus is an open-source project, maintained by a small core team and community contributors who have limited time and
resources.

Our platform is feature-rich, however we strictly adhere to our
[80/20 Rule](/contributing/introduction#feature-requests) to avoid a messy/bloated codebase. Directus is also quite
stable, however new issues still arise, some of which may be triaged with a lower prioritization.

If you need, you can contact us about [sponsoring expedited fixes](#expedited-fixes) or
[commissioning new features](#commissioned-features). You can also
[submit a pull request](https://github.com/LaWebcapsule/directus9/pulls) — after all, it is open-source!

### Can you give an ETA for this feature/fix?

If it is sponsored work, then yes, delivery dates are part of our statement of work agreements. Otherwise, most likely
not. This is open-source software, work is prioritized internally, and all timelines are subject to change.

### But this is an emergency, my very important project requires it now!

We understand, and are here to help. If you need something prioritized, you can reach out to us to discuss
[premium support](#basic-and-premium-support), [sponsoring expedited fixes](#expedited-fixes) or
[commissioning new features](#commissioned-features).
