---
description: How to get support for your DB Studio (Formerly Directus v9) project.
readTime: 4 min read
---

# Help & Support

> If you have questions while working with DB Studio (Formerly Directus v9), there are many resources to help you get up-and-running smoothly.

## Troubleshooting Steps

If you're experiencing issues or think you have found a problem in DB Studio (Formerly Directus v9), be sure to follow these steps before
[Reporting a Bug](/contributing/introduction#bug-reporting):

1. Ensure your server and database meet the [minimum requirements](/self-hosted/docker-guide.html#supported-databases).
2. Ensure you’re on the [latest version](https://github.com/pxslip/db-studio/releases/latest) of DB Studio (Formerly Directus v9).
3. Stop `CTRL+C` and restart the server `pnpmx db-studio start`.
4. Run the database migration script: `db-studio database migrate:latest`\
   _Note: backup your database first._
5. Disable any data-caching within your project.
6. Test any app issues with both browser extensions and caching disabled _(i.e. Incognito Mode)_.
7. Confirm the issue is not related to your own custom code.
8. Check for [existing Issues](https://github.com/pxslip/db-studio/issues?q=is%3Aissue) (and
   [Discussions](https://github.com/pxslip/db-studio/discussions)) that match your problem.

If you're still experiencing a problem after completing the above steps, you can chat through things on our
[community support](#community-support) or [report a bug](/contributing/introduction#bug-reporting).

## Support Tiers

### Community Support

[GitHub Discussions](https://github.com/pxslip/db-studio/discussions) is a great first place to reach out for help. Our
community and core developers often check this platform and answer posts. It has the added benefit of being an archival
resource for others developers with similar questions.

Our [Discord Community](https://directus.chat) is another great way to get assistance. Please keep all questions in the
help channels, be considerate, and remember that you are getting free help from the community.

:::warning No Guaranteed Response Time

While the Directus Core Team plays an active and engaged role in community discussions, there is no guaranteed response
time for Community Support.

:::
