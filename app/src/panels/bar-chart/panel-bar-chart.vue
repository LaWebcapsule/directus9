<template>
	<div ref="canvas"></div>
</template>

<script setup lang="ts">
import ApexCharts from 'apexcharts';
import { computed, onMounted, onUnmounted, ref } from 'vue';

const canvas = ref<HTMLDivElement | null>(null);
const chart = ref<ApexCharts>();

const props = withDefaults(
	defineProps<{
		showHeader?: boolean;
		collection: string;
		category: string;
		values: string;
		data?: Record<string, Record<string, string | number>>[];
		aggregate: string;
	}>(),
	{
		aggregate: 'avg',
	},
);
console.log(props.data);
const data = computed(() => {
	const seriesData = props.data?.map((item) => {
		return {
			y: item[props.aggregate][props.values],
			x: item['group'][props.category],
		};
	});
	console.log(seriesData);
	const data = {
		chart: {
			type: 'bar',
			fontFamily: 'var(--family-sans-serif)',
			foreColor: 'var(--foreground-normal)',
		},
		plotOptions: {
			bar: {
				horizontal: false,
			},
		},
		fill: {
			opacity: 1,
		},
		series: [
			{
				data: seriesData,
			},
		],
	};
	return data;
});

onMounted(() => {
	if (canvas.value) {
		chart.value = new ApexCharts(canvas.value, data.value);
		chart.value.render();
	}
});

onUnmounted(() => {
	if (chart.value) {
		chart.value.destroy();
	}
});
</script>

<style scoped>
.text {
	padding: 12px;
}

.text.has-header {
	padding: 0 12px;
}
</style>
