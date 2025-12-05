<template>
	<div class="input-toggle">
		<template v-if="isFieldRef && allowFieldComparison">
			<v-select
				inline
				:model-value="fieldRefValue"
				:items="fieldOptions"
				:placeholder="t('interfaces.filter.select_field')"
				@update:model-value="updateFieldRef($event)"
			/>
		</template>
		<input-component
			v-else
			:is="inputComponent || 'interface-input'"
			:type="type"
			:value="currentValue"
			:choices="choices"
			:focus="focus"
			@input="updateValue($event)"
		/>
		<v-icon
			v-if="allowFieldComparison"
			v-tooltip="isFieldRef ? t('interfaces.filter.switch_to_value') : t('interfaces.filter.switch_to_field')"
			:name="isFieldRef ? 'tag' : 'compare_arrows'"
			class="toggle-field-mode"
			small
			clickable
			@click="toggleMode"
		/>
	</div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useFieldsStore } from '@/stores/fields';
import { useI18n } from 'vue-i18n';
import InputComponent from './input-component.vue';

const FIELD_REF_PATTERN = /^\$FIELD\([^)]+\)$/;

interface Props {
	value: any;
	type: string;
	choices?: any[];
	focus?: boolean;
	allowFieldComparison?: boolean;
	collection: string;
	currentField: string;
	inputComponent?: string;
}

const props = withDefaults(defineProps<Props>(), {
	choices: () => [],
	focus: true,
	allowFieldComparison: false,
	inputComponent: undefined,
});

const emit = defineEmits<{
	'update:value': [value: any];
}>();

const { t } = useI18n();
const fieldsStore = useFieldsStore();

const isFieldRef = computed(() => {
	return typeof props.value === 'string' && FIELD_REF_PATTERN.test(props.value);
});

const fieldRefValue = computed(() => {
	if (!isFieldRef.value) return null;
	const match = props.value.toString().match(/^\$FIELD\(([^)]+)\)$/);
	return match ? match[1]! : null;
});

const currentValue = computed(() => {
	if (isFieldRef.value) return null;
	return props.value;
});

const fieldOptions = computed(() => {
	const fields = fieldsStore.getFieldsForCollection(props.collection);
	const currentFieldInfo = fieldsStore.getField(props.collection, props.currentField);

	return Object.values(fields)
		.filter((field) => {
			if (field.field === props.currentField) return false;

			if (field.type === 'alias') return false;

			if (!currentFieldInfo) return true;

			const fieldType = field.type;
			const currentFieldType = currentFieldInfo.type === 'alias' ? 'unknown' : currentFieldInfo.type;

			return (
				fieldType === currentFieldType ||
				['integer', 'bigInteger', 'float', 'decimal', 'date', 'dateTime', 'timestamp', 'time', 'string', 'text'].includes(fieldType)
			);
		})
		.map((field) => ({
			text: field.name || field.field,
			value: field.field,
		}));
});

function updateValue(newValue: any) {
	emit('update:value', newValue);
}

function updateFieldRef(fieldKey: string | null) {
	if (!fieldKey) {
		emit('update:value', null);
		return;
	}
	emit('update:value', `$FIELD(${fieldKey})`);
}

function toggleMode() {
	if (isFieldRef.value) {
		emit('update:value', null);
	} else {
		const firstOption = fieldOptions.value[0]?.value || '';
		emit('update:value', firstOption ? `$FIELD(${firstOption})` : null);
	}
}
</script>

<style lang="scss" scoped>
.input-toggle {
	display: flex;
	align-items: center;
	gap: 4px;
}

.toggle-field-mode {
	--v-icon-color: var(--foreground-subdued);
	--v-icon-color-hover: var(--primary);

	flex-shrink: 0;
}
</style>
