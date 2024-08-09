<template>
	<div class="text" :class="{ 'has-header': showHeader }">
		<pre>Data: {{ data }}</pre>
		<pre>Collection: {{ collection }}</pre>
		<pre>Category: {{ category }}</pre>
		<pre>Values: {{ values }}</pre>
		<pre>Aggregate: {{ aggregate }}</pre>
	</div>
</template>

<script setup lang="ts">
const props = withDefaults(
	defineProps<{
		showHeader?: boolean;
		collection: string;
		category: string;
		values: string;
		data?: Record<string, unknown>;
		aggregate: string;
	}>(),
	{
		aggregate: 'avg',
	},
);
</script>

<style scoped>
.text {
	padding: 12px;
}

.text.has-header {
	padding: 0 12px;
}
</style>
