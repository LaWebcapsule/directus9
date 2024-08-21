<template>
	<v-input :type="inputType" :model-value="value" @update:model-value="validate" :class="{ invalid: !valid }" />
	<span v-if="!valid">{{ message }}</span>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const emit = defineEmits(['input']);
const { t } = useI18n();

interface Props {
	value: string;
	validationMessage: string;
	validationRegex: string;
	inputType: 'date' | 'datetime-local' | 'week' | 'month' | 'time' | 'number' | 'text';
}

const props = withDefaults(defineProps<Props>(), {
	validationRegex: '\\d{4}-\\d{2}-\\d{2}',
	inputType: 'date',
});

const valid = ref(true);

const message = computed(() => {
	return props.validationMessage ?? t('interfaces.raw-date.defaultMessage');
});

const regex = computed(() => {
	return new RegExp(props.validationRegex);
});

const validate = (value: string) => {
	valid.value = regex.value.test(value);
	emit('input', value);
};
</script>

<style scoped>
input.invalid {
	border: 1px solid var(--danger);
}
</style>
