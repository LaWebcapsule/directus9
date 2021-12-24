<template>
	<div class="shared" :class="{ inline }">
		<div class="inline-container">
			<header>
				<div class="container">
					<div class="title-box">
						<div
							v-if="serverInfo?.project.project_logo"
							class="logo"
							:style="{ backgroundColor: serverInfo?.project.project_color }"
						>
							<img :src="logoURL" :alt="serverInfo?.project.project_name || 'Logo'" />
						</div>
						<div v-else class="logo" :style="{ backgroundColor: serverInfo?.project.project_color }">
							<img src="../../assets/logo.svg" alt="Directus" class="directus-logo" />
						</div>
						<div class="title">
							<p class="subtitle">{{ serverInfo?.project.project_name }}</p>
							<slot name="title">
								<h1 class="type-title">{{ title ?? t('share_access_page') }}</h1>
							</slot>
						</div>
					</div>
				</div>
			</header>

			<div class="container">
				<div class="content">
					<slot />
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useServerStore } from '@/stores';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';

export default defineComponent({
	name: 'SharedView',
	props: {
		title: {
			type: String,
			default: null,
		},
		inline: {
			type: Boolean,
			default: false,
		},
	},
	setup() {
		const serverStore = useServerStore();

		const { info } = storeToRefs(serverStore);

		const { t } = useI18n();

		return {
			serverInfo: info,
			t,
		};
	},
});
</script>

<style scoped lang="scss">
.shared {
	--border-radius: 6px;
	--input-height: 60px;
	--input-padding: 16px;

	width: 100%;
	height: 100%;
	padding-bottom: 64px;
	overflow: auto;
	background-color: var(--background-subdued);
}

.inline-container {
	display: contents;
}

header {
	margin-bottom: 32px;
	padding: 10px;
	background-color: var(--background-page);
	border-bottom: var(--border-width) solid var(--border-subdued);
}

.container {
	max-width: 856px;
	margin: 0 auto;
}

.title-box {
	display: flex;
	align-items: center;
	width: max-content;
	max-width: 100%;
	height: 60px;
	margin-top: 2px;

	.title {
		margin-left: 16px;

		h1 {
			color: var(--foreground-normal);
			font-weight: 700;
			font-size: 24px;
			line-height: 24px;
		}

		.subtitle {
			width: 100%;
			color: var(--foreground-subdued);
		}
	}
}

.logo {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 60px;
	height: 60px;
	background-color: var(--brand);
	border-radius: var(--border-radius);

	img {
		width: 40px;
		height: 40px;
		object-fit: contain;
		object-position: center center;
	}
}

.content {
	padding: 32px;
	background-color: var(--background-page);
	border-radius: var(--border-radius);
	box-shadow: 0px 4px 12px rgba(38, 50, 56, 0.1);
}

.inline {
	display: flex;
	align-items: center;
	justify-content: center;

	.inline-container {
		display: block;
		width: 100%;
		max-width: 856px;
		padding: 32px;
		background-color: var(--background-page);
		border-radius: var(--border-radius);
		box-shadow: 0px 4px 12px rgba(38, 50, 56, 0.1);

		@media (min-width: 618px) {
			width: 618px;
		}
	}

	header {
		padding: 0;
		border-bottom: 0;
	}

	.container {
		display: contents;
	}

	.content {
		display: contents;
	}
}
</style>