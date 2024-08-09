<template>
	<div id="sandbox"></div>
</template>

<script lang="ts" setup>
import { ApolloSandbox } from '@apollo/sandbox';
import { onMounted } from 'vue';

onMounted(() => {
	new ApolloSandbox({
		target: '#sandbox',
	});
});
</script>
