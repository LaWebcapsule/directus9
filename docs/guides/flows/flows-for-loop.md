---
description:
  When most flows begin, they pass the trigger's payload to the data chain and execute once. This recipe explains how to
  execute a flow for each element in a payload's array.
tags: []
skill_level:
directus_version: 9.18.1
author_override:
author: Eron Powell
---

# For Loops In Flows

> {{ $frontmatter.description }}

:::tip Author: {{$frontmatter.author}}

<!-- **Skill Level:** {{$frontmatter.skill_level}}\ -->

**Directus9 Version:** {{$frontmatter.directus_version}}

<!-- **Tags:** {{$frontmatter.tags.join(", ")}} -->

:::

## Explanation

<!--
See the VitePress docs to learn about its markdown options:
https://vitepress.vuejs.org/guide/markdown
-->

Sometimes you may have an array of data you'd like to iterate over and run operations on, one-by-one. However, you may
have noticed that each operation in a flow executes just one time. Because of this, you can't create a "for-loop" within
the operations of a single flow.

However, to achieve a "for-loop", you can instead use the
[trigger flow](/configuration/flows/operations.md#trigger-flow) operation to pass the data into an
[another flow](/configuration/flows/triggers.md#another-flow) trigger. When this type of trigger receives an array as a
Payload, the flow runs for each item in the array individually.

:::tip

Remember: for some use-cases, you can also iterate through data in a
[Run Script](/configuration/flows/operations.md#run-script) operation.

:::

## The Recipe

:::tip Requirements

You'll need a flow with an array of data on its data chain.

:::

<!--
<video autoplay playsinline muted loop controls>
	<source src="" type="video/mp4" />
</video>

VIDEO IS OPTIONAL: delete if not needed
-->

### Configure the Starting Flow

1. Configure a [flow](/configuration/flows.md#configure-a-flow) a
   [trigger flow](/configuration/flows/operations.md#trigger-flow) operation.
2. Under **Payload**, be sure to add the desired array.
3. Save and exit the flow.

### Configure the "For-Loop" Flow

Once your starting flow is configured as desired, follow these steps.

1. [Create a flow](/configuration/flows.md#create-a-flow) using the
   [another flow](/configuration/flows/triggers.md#another-flow) trigger.
2. [Configure operations](/configuration/flows.md#configure-an-operation) as desired.

## Final Tips

Once your for-loop is configured, you can process the data several ways.

First, you could simple let the "for-loop" flow process each element in the **Payload**.

Second, you could also configure a **Response Body** in the trigger of your "for-loop" flow. The **Response Body** gets
appended under the [trigger flow](/configuration/flows/operations.md#trigger-flow) operation in the starting flow.

Third, you could add another [trigger flow](/configuration/flows/operations.md#trigger-flow) operation into the
"for-loop" flow, to create complex flow chains. If you do this, just keep API performance in mind. If you configure a
**Response Body**, the parent flow will halt execution until it receives **Response Body**.

Good luck and have fun! :cook:
