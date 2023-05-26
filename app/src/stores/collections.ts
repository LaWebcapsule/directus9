import api from '@/api';
import { i18n } from '@/lang';
import { Collection as CollectionRaw, DeepPartial, Field } from '@wbce-d9/types';
import { Collection } from '@/types/collections';
import { getCollectionType } from '@wbce-d9/utils';
import { notify } from '@/utils/notify';
import { getLiteralInterpolatedTranslation } from '@/utils/get-literal-interpolated-translation';
import { unexpectedError } from '@/utils/unexpected-error';
import formatTitle from '@wbce-d9/format-title';
import { defineStore } from 'pinia';
import { COLLECTIONS_DENY_LIST } from '@/constants';
import { isEqual, orderBy, omit, isNil } from 'lodash';
import { useRelationsStore } from './relations';

export const useCollectionsStore = defineStore({
	id: 'collectionsStore',
	state: () => ({
		collections: [] as Collection[],
	}),
	getters: {
		visibleCollections(): Collection[] {
			return this.collections
				.filter(({ collection }) => collection.startsWith('directus_') === false)
				.filter((collection) => collection.meta && collection.meta?.hidden !== true);
		},
		allCollections(): Collection[] {
			return this.collections.filter(({ collection }) => collection.startsWith('directus_') === false);
		},
		databaseCollections(): Collection[] {
			return this.allCollections.filter((collection) => collection.schema);
		},
		crudSafeSystemCollections(): Collection[] {
			return orderBy(
				this.collections.filter((collection) => {
					return collection.collection.startsWith('directus_') === true;
				}),
				['collection'],
				['asc']
			).filter((collection) => COLLECTIONS_DENY_LIST.includes(collection.collection) === false);
		},
	},
	actions: {
		async hydrate() {
			const response = await api.get<any>(`/collections`, { params: { limit: -1 } });

			const collections: CollectionRaw[] = response.data.data;

			this.collections = collections.map(this.prepareCollectionForApp);
		},
		prepareCollectionForApp(collection: CollectionRaw): Collection {
			const icon = collection.meta?.icon || 'label';
			const color = collection.meta?.color;
			let name = formatTitle(collection.collection);
			const type = getCollectionType(collection);

			const localesToKeep =
				collection.meta && !isNil(collection.meta.translations) && Array.isArray(collection.meta.translations)
					? collection.meta.translations.map((translation) => translation.language)
					: [];

			for (const locale of i18n.global.availableLocales) {
				if (i18n.global.te(`collection_names.${collection.collection}`, locale) && !localesToKeep.includes(locale)) {
					i18n.global.mergeLocaleMessage(locale, { collection_names: { [collection.collection]: undefined } });
				}
			}

			if (collection.meta && !isNil(collection.meta.translations) && Array.isArray(collection.meta.translations)) {
				for (let i = 0; i < collection.meta.translations.length; i++) {
					const { language, translation, singular, plural } = collection.meta.translations[i];

					i18n.global.mergeLocaleMessage(language, {
						...(translation
							? {
									collection_names: {
										[collection.collection]: getLiteralInterpolatedTranslation(translation),
									},
							  }
							: {}),
						...(singular
							? {
									collection_names_singular: {
										[collection.collection]: getLiteralInterpolatedTranslation(singular),
									},
							  }
							: {}),
						...(plural
							? {
									collection_names_plural: {
										[collection.collection]: getLiteralInterpolatedTranslation(plural),
									},
							  }
							: {}),
					});
				}
			}

			if (i18n.global.te(`collection_names.${collection.collection}`)) {
				name = i18n.global.t(`collection_names.${collection.collection}`);
			}

			return {
				...collection,
				name,
				type,
				icon,
				color,
			};
		},
		async dehydrate() {
			this.$reset();
		},
		translateCollections() {
			this.collections = this.collections.map((collection) => {
				if (i18n.global.te(`collection_names.${collection.collection}`)) {
					collection.name = i18n.global.t(`collection_names.${collection.collection}`);
				}

				return collection;
			});
		},
		async upsertCollection(collection: string, values: DeepPartial<Collection & { fields: Field[] }>) {
			const existing = this.getCollection(collection);

			// Strip out any fields the app might've auto-generated at some point
			const rawValues = omit(values, ['name', 'type', 'icon', 'color']);

			try {
				if (existing) {
					if (isEqual(existing, values)) return;

					const updatedCollectionResponse = await api.patch<{ data: CollectionRaw }>(
						`/collections/${collection}`,
						rawValues
					);

					this.collections = this.collections.map((existingCollection: Collection) => {
						if (existingCollection.collection === collection) {
							return this.prepareCollectionForApp(updatedCollectionResponse.data.data);
						}

						return existingCollection;
					});
				} else {
					const createdCollectionResponse = await api.post<{ data: CollectionRaw }>('/collections', rawValues);

					this.collections = [...this.collections, this.prepareCollectionForApp(createdCollectionResponse.data.data)];
				}
			} catch (err: any) {
				unexpectedError(err);
			}
		},
		async updateCollection(collection: string, updates: DeepPartial<Collection>) {
			try {
				await api.patch(`/collections/${collection}`, updates);
				await this.hydrate();

				notify({
					title: i18n.global.t('update_collection_success'),
				});
			} catch (err: any) {
				unexpectedError(err);
			}
		},
		async deleteCollection(collection: string) {
			const relationsStore = useRelationsStore();

			try {
				await api.delete(`/collections/${collection}`);
				await Promise.all([this.hydrate(), relationsStore.hydrate()]);

				notify({
					title: i18n.global.t('delete_collection_success'),
				});
			} catch (err: any) {
				unexpectedError(err);
			}
		},
		getCollection(collectionKey: string): Collection | null {
			return this.collections.find((collection) => collection.collection === collectionKey) || null;
		},
	},
});
