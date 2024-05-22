---
description:
  This module provides a collective timeline of all actions taken within the project. These detailed records allow for
  auditing user activity and enforcing accountability.
readTime: 2 min read
---

# Activity Log

> This module provides a collective timeline of all _data-changing_ actions taken within your project. These detailed
> records help you audit user activity and enforce accountability.

:::tip Before You Begin

We recommend you try the [Quickstart Guide](/getting-started/quickstart.md) to get an overview of the platform.

:::

:::tip Learn More

To manage the Activity Log programmatically, please see our guide on the
[Activity Log API](/reference/system/activity.md).

:::

## Overview

The Activity Log is the only Module in Directus Core that is not found in the [Module Bar](/app/overview#_1-module-bar).
Instead, it is accessed via the notifications tray of the [Sidebar](/app/overview#_4-sidebar). The Activity Log page has
the same features and functionality as the [Collection Page](/app/content/collections).

::: warning External Changes

The platform can only track the events which actually pass through it. Therefore, any changes made to the database
_directly_ are not tracked.

:::

:::tip

You can also view and revert the activity of _specific items_ under **Item Page > Sidebar > Revisions**. To learn more,
please see [Revert an Item](/app/content/items#revert-an-item).

:::

## View an Activity Log Item

Click any item in the Activity Log and a side drawer will open, displaying its logged details. The following information
is stored for each item.

- **User** — The user that performed the action.
- **Action** — The specific action taken _(e.g., Create, Update, Delete, Comment, or Login)_.
- **TimeStamp** — The timestamp of when the action was performed.
- **IP Address** — The IP address of the device from which the action was performed.
- **User Agent** — The description of the browser that was used to perform the action.
- **Collection** — The Collection affected by the action.
- **Item** — The ID of the item affected.
- **Comment** — The comment left by the user _(when applicable)_.

## Filter by Activity

In addition to the filter and display functionality inherited from the [Collection Page](/app/content/collections), you
can also filter items by activity from the Navigation Bar.

## Modify an Activity

To ensure proper accountability, system collections are **read only** by design. However, users with an Admin role have
the ability to reopen, view, and modify an item's values in activities from non-system collections (where the name does
not begin with `directus_`). To view or modify an activity, follow these steps.

1. Navigate to the Activity Log page.
2. Click the desired item. A drawer will open, displaying its activity log.
3. Click <span mi btn>launch</span> to reopen the item page and make modifications as desired.
4. In the page header, click <span mi btn>check</span> to confirm.

Once confirmed, any updates to an item will be logged as a new activity.
