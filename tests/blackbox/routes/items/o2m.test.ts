import request from 'supertest';
import config, { getUrl } from '@common/config';
import vendors from '@common/get-dbs-to-test';
import { v4 as uuid } from 'uuid';
import { CreateItem, ReadItem } from '@common/functions';
import { CachedTestsSchema, TestsSchemaVendorValues } from '@query/filter';
import * as common from '@common/index';
import {
	collectionCountries,
	collectionStates,
	collectionCities,
	Country,
	State,
	City,
	getTestsSchema,
	seedDBValues,
} from './o2m.seed';
import { CheckQueryFilters } from '@query/filter';
import { findIndex } from 'lodash';
import { requestGraphQL } from '@common/index';

function createCountry(pkType: common.PrimaryKeyType) {
	const item: Country = {
		name: 'country-' + uuid(),
	};

	if (pkType === 'string') {
		item.id = 'country-' + uuid();
	}

	return item;
}

function createState(pkType: common.PrimaryKeyType) {
	const item: State = {
		name: 'state-' + uuid(),
	};

	if (pkType === 'string') {
		item.id = 'state-' + uuid();
	}

	return item;
}

function createCity(pkType: common.PrimaryKeyType) {
	const item: City = {
		name: 'city-' + uuid(),
	};

	if (pkType === 'string') {
		item.id = 'city-' + uuid();
	}

	return item;
}

const cachedSchema = common.PRIMARY_KEY_TYPES.reduce((acc, pkType) => {
	acc[pkType] = getTestsSchema(pkType);
	return acc;
}, {} as CachedTestsSchema);

const vendorSchemaValues: TestsSchemaVendorValues = {};

beforeAll(async () => {
	await seedDBValues(cachedSchema, vendorSchemaValues);
}, 300000);

describe('Seed Database Values', () => {
	it.each(vendors)('%s', async (vendor) => {
		// Assert
		expect(vendorSchemaValues[vendor]).toBeDefined();
	});
});

describe.each(common.PRIMARY_KEY_TYPES)('/items', (pkType) => {
	const localCollectionCountries = `${collectionCountries}_${pkType}`;
	const localCollectionStates = `${collectionStates}_${pkType}`;
	const localCollectionCities = `${collectionCities}_${pkType}`;

	describe(`pkType: ${pkType}`, () => {
		describe('GET /:collection/:id', () => {
			describe(`retrieves a country's states`, () => {
				it.each(vendors)('%s', async (vendor) => {
					// Setup
					const insertedCountry = await CreateItem(vendor, {
						collection: localCollectionCountries,
						item: createCountry(pkType),
					});

					const state = createState(pkType);
					state.country_id = insertedCountry.id;
					const insertedState = await CreateItem(vendor, { collection: localCollectionStates, item: state });

					// Action
					const response = await request(getUrl(vendor))
						.get(`/items/${localCollectionCountries}/${insertedCountry.id}`)
						.set('Authorization', `Bearer ${common.USER.ADMIN.TOKEN}`);

					const gqlResponse = await requestGraphQL(getUrl(vendor), false, common.USER.ADMIN.TOKEN, {
						query: {
							[localCollectionCountries]: {
								__args: {
									filter: {
										id: {
											_eq: insertedCountry.id,
										},
									},
								},
								states: {
									id: true,
								},
							},
						},
					});

					// Assert
					expect(response.statusCode).toEqual(200);
					expect(response.body.data).toMatchObject({ states: [insertedState.id] });

					expect(gqlResponse.statusCode).toEqual(200);

					expect(gqlResponse.body.data).toMatchObject({
						[localCollectionCountries]: [{ states: [{ id: String(insertedState.id) }] }],
					});
				});
			});
		});

		describe('GET /:collection', () => {
			describe('filters', () => {
				describe('on top level', () => {
					it.each(vendors)('%s', async (vendor) => {
						// Setup
						const country = createCountry(pkType);
						country.name = 'country-o2m-top-' + uuid();

						const insertedCountry = await CreateItem(vendor, {
							collection: localCollectionCountries,
							item: country,
						});

						// Action
						const response = await request(getUrl(vendor))
							.get(`/items/${localCollectionCountries}`)
							.query({
								filter: { id: { _eq: insertedCountry.id } },
							})
							.set('Authorization', `Bearer ${common.USER.ADMIN.TOKEN}`);

						const response2 = await request(getUrl(vendor))
							.get(`/items/${localCollectionCountries}`)
							.query({
								filter: { name: { _eq: insertedCountry.name } },
							})
							.set('Authorization', `Bearer ${common.USER.ADMIN.TOKEN}`);

						const gqlResponse = await requestGraphQL(getUrl(vendor), false, common.USER.ADMIN.TOKEN, {
							query: {
								[localCollectionCountries]: {
									__args: {
										filter: {
											id: {
												_eq: insertedCountry.id,
											},
										},
									},
									id: true,
								},
							},
						});

						const gqlResponse2 = await requestGraphQL(getUrl(vendor), false, common.USER.ADMIN.TOKEN, {
							query: {
								[localCollectionCountries]: {
									__args: {
										filter: {
											name: {
												_eq: insertedCountry.name,
											},
										},
									},
									id: true,
								},
							},
						});

						// Assert
						expect(response.statusCode).toEqual(200);
						expect(response.body.data.length).toBe(1);
						expect(response.body.data[0]).toMatchObject({ id: insertedCountry.id });
						expect(response2.statusCode).toEqual(200);
						expect(response.body.data).toEqual(response2.body.data);

						expect(gqlResponse.statusCode).toBe(200);
						expect(gqlResponse.body.data[localCollectionCountries].length).toBe(1);

						expect(gqlResponse.body.data[localCollectionCountries][0]).toMatchObject({
							id: String(insertedCountry.id),
						});

						expect(gqlResponse2.statusCode).toBe(200);
						expect(gqlResponse.body.data).toEqual(gqlResponse2.body.data);
					});
				});

				describe('on o2m level', () => {
					it.each(vendors)('%s', async (vendor) => {
						// Setup
						const country = createCountry(pkType);
						country.name = 'country-o2m-' + uuid();

						const insertedCountry = await CreateItem(vendor, {
							collection: localCollectionCountries,
							item: country,
						});

						const state = createState(pkType);
						state.name = 'state-o2m-' + uuid();
						state.country_id = insertedCountry.id;
						const insertedState = await CreateItem(vendor, { collection: localCollectionStates, item: state });

						// Action
						const response = await request(getUrl(vendor))
							.get(`/items/${localCollectionCountries}`)
							.query({
								filter: JSON.stringify({ states: { id: { _eq: insertedState.id } } }),
							})
							.set('Authorization', `Bearer ${common.USER.ADMIN.TOKEN}`);

						const response2 = await request(getUrl(vendor))
							.get(`/items/${localCollectionCountries}`)
							.query({
								filter: JSON.stringify({ states: { name: { _eq: insertedState.name } } }),
							})
							.set('Authorization', `Bearer ${common.USER.ADMIN.TOKEN}`);

						const gqlResponse = await requestGraphQL(getUrl(vendor), false, common.USER.ADMIN.TOKEN, {
							query: {
								[localCollectionCountries]: {
									__args: {
										filter: {
											states: { id: { _eq: insertedState.id } },
										},
									},
									id: true,
								},
							},
						});

						const gqlResponse2 = await requestGraphQL(getUrl(vendor), false, common.USER.ADMIN.TOKEN, {
							query: {
								[localCollectionCountries]: {
									__args: {
										filter: {
											states: { name: { _eq: insertedState.name } },
										},
									},
									id: true,
								},
							},
						});

						// Assert
						expect(response.statusCode).toEqual(200);
						expect(response.body.data.length).toBe(1);
						expect(response.body.data[0]).toMatchObject({ id: insertedCountry.id });
						expect(response2.statusCode).toEqual(200);
						expect(response.body.data).toEqual(response2.body.data);

						expect(gqlResponse.statusCode).toBe(200);
						expect(gqlResponse.body.data[localCollectionCountries].length).toBe(1);

						expect(gqlResponse.body.data[localCollectionCountries][0]).toMatchObject({
							id: String(insertedCountry.id),
						});

						expect(gqlResponse2.statusCode).toBe(200);
						expect(gqlResponse.body.data).toEqual(gqlResponse2.body.data);
					});
				});
			});

			describe('filters with functions', () => {
				describe('on top level', () => {
					it.each(vendors)('%s', async (vendor) => {
						// Setup
						await CreateItem(vendor, {
							collection: localCollectionCountries,
							item: {
								...createCountry(pkType),
								name: 'test_country_top',
								states: {
									create: [
										{
											...createState(pkType),
											name: 'test_state_top_1',
										},
										{
											...createState(pkType),
											name: 'test_state_top_2',
										},
									],
									update: [],
									delete: [],
								},
							},
						});

						await CreateItem(vendor, {
							collection: localCollectionCountries,
							item: {
								...createCountry(pkType),
								name: 'test_country_top',
							},
						});

						// Action
						const response = await request(getUrl(vendor))
							.get(`/items/${localCollectionCountries}`)
							.query({
								filter: JSON.stringify({
									_and: [
										{
											name: { _eq: 'test_country_top' },
										},
										{
											'count(states)': { _eq: 2 },
										},
									],
								}),
							})
							.set('Authorization', `Bearer ${common.USER.ADMIN.TOKEN}`);

						const responseTotal = await request(getUrl(vendor))
							.get(`/items/${localCollectionCountries}`)
							.query({
								filter: JSON.stringify({
									name: { _eq: 'test_country_top' },
								}),
							})
							.set('Authorization', `Bearer ${common.USER.ADMIN.TOKEN}`);

						const gqlResponse = await requestGraphQL(getUrl(vendor), false, common.USER.ADMIN.TOKEN, {
							query: {
								[localCollectionCountries]: {
									__args: {
										filter: {
											_and: [
												{
													name: { _eq: 'test_country_top' },
												},
												{
													states_func: { count: { _eq: 2 } },
												},
											],
										},
									},
									name: true,
								},
							},
						});

						const gqlResponseTotal = await requestGraphQL(getUrl(vendor), false, common.USER.ADMIN.TOKEN, {
							query: {
								[localCollectionCountries]: {
									__args: {
										filter: {
											name: { _eq: 'test_country_top' },
										},
									},
									name: true,
								},
							},
						});

						// Assert
						expect(response.statusCode).toEqual(200);
						expect(response.body.data.length).toEqual(1);
						expect(responseTotal.statusCode).toEqual(200);
						expect(responseTotal.body.data.length).toEqual(2);

						expect(gqlResponse.statusCode).toEqual(200);
						expect(gqlResponse.body.data[localCollectionCountries].length).toEqual(1);
						expect(gqlResponseTotal.statusCode).toEqual(200);
						expect(gqlResponseTotal.body.data[localCollectionCountries].length).toEqual(2);
					});
				});

				describe('on o2m level', () => {
					it.each(vendors)('%s', async (vendor) => {
						// Setup
						await CreateItem(vendor, {
							collection: localCollectionCountries,
							item: {
								...createCountry(pkType),
								name: 'test_country_nested',
								states: {
									create: [
										{
											...createState(pkType),
											name: 'test_state_nested_1',
											cities: {
												create: [
													{
														...createCity(pkType),
														name: 'test_city_nested_1',
													},
													{
														...createState(pkType),
														name: 'test_city_nested_2',
													},
												],
												update: [],
												delete: [],
											},
										},
										{
											...createState(pkType),
											name: 'test_state_nested_2',
											cities: {
												create: [
													{
														...createCity(pkType),
														name: 'test_city_nested_3',
													},
													{
														...createState(pkType),
														name: 'test_city_nested_4',
													},
												],
												update: [],
												delete: [],
											},
										},
									],
									update: [],
									delete: [],
								},
							},
						});

						await CreateItem(vendor, {
							collection: localCollectionCountries,
							item: {
								...createCountry(pkType),
								name: 'test_country_nested',
								states: {
									create: [
										{
											...createState(pkType),
											name: 'test_state_nested_3',
											cities: {
												create: [
													{
														...createCity(pkType),
														name: 'test_city_nested_5',
													},
												],
												update: [],
												delete: [],
											},
										},
										{
											...createState(pkType),
											name: 'test_state_nested_4',
											cities: {
												create: [
													{
														...createCity(pkType),
														name: 'test_city_nested_6',
													},
												],
												update: [],
												delete: [],
											},
										},
									],
									update: [],
									delete: [],
								},
							},
						});

						// Action
						const response = await request(getUrl(vendor))
							.get(`/items/${localCollectionCountries}`)
							.query({
								filter: JSON.stringify({
									_and: [
										{
											name: { _eq: 'test_country_nested' },
										},
										{
											states: {
												'count(cities)': { _eq: 2 },
											},
										},
										{
											states: {
												country_id: {
													'count(states)': { _eq: 2 },
												},
											},
										},
									],
								}),
							})
							.set('Authorization', `Bearer ${common.USER.ADMIN.TOKEN}`);

						const responseTotal = await request(getUrl(vendor))
							.get(`/items/${localCollectionCountries}`)
							.query({
								filter: JSON.stringify({
									name: { _eq: 'test_country_nested' },
								}),
							})
							.set('Authorization', `Bearer ${common.USER.ADMIN.TOKEN}`);

						const gqlResponse = await requestGraphQL(getUrl(vendor), false, common.USER.ADMIN.TOKEN, {
							query: {
								[localCollectionCountries]: {
									__args: {
										filter: {
											_and: [
												{
													name: { _eq: 'test_country_nested' },
												},
												{
													states: {
														cities_func: { count: { _eq: 2 } },
													},
												},
												{
													states: {
														country_id: {
															states_func: { count: { _eq: 2 } },
														},
													},
												},
											],
										},
									},
									name: true,
								},
							},
						});

						const gqlResponseTotal = await requestGraphQL(getUrl(vendor), false, common.USER.ADMIN.TOKEN, {
							query: {
								[localCollectionCountries]: {
									__args: {
										filter: {
											name: { _eq: 'test_country_nested' },
										},
									},
									name: true,
								},
							},
						});

						// Assert
						expect(response.statusCode).toEqual(200);
						expect(response.body.data.length).toEqual(1);
						expect(responseTotal.statusCode).toEqual(200);
						expect(responseTotal.body.data.length).toEqual(2);

						expect(gqlResponse.statusCode).toEqual(200);
						expect(gqlResponse.body.data[localCollectionCountries].length).toEqual(1);
						expect(gqlResponseTotal.statusCode).toEqual(200);
						expect(gqlResponseTotal.body.data[localCollectionCountries].length).toEqual(2);
					});
				});
			});

			describe('sorts', () => {
				describe('on top level', () => {
					beforeAll(async () => {
						for (const vendor of vendors) {
							// Setup
							const sortValues = [4, 2, 3, 5, 1];
							const countries = [];

							for (const val of sortValues) {
								const country = createCountry(pkType);
								country.name = 'country-o2m-top-sort-' + val;
								countries.push(country);
							}

							await CreateItem(vendor, {
								collection: localCollectionCountries,
								item: countries,
							});
						}
					});

					describe('without limit', () => {
						it.each(vendors)('%s', async (vendor) => {
							// Action
							const response = await request(getUrl(vendor))
								.get(`/items/${localCollectionCountries}`)
								.query({
									sort: 'name',
									filter: { name: { _starts_with: 'country-o2m-top-sort-' } },
								})
								.set('Authorization', `Bearer ${common.USER.ADMIN.TOKEN}`);

							const response2 = await request(getUrl(vendor))
								.get(`/items/${localCollectionCountries}`)
								.query({
									sort: '-name',
									filter: { name: { _starts_with: 'country-o2m-top-sort-' } },
								})
								.set('Authorization', `Bearer ${common.USER.ADMIN.TOKEN}`);

							const gqlResponse = await requestGraphQL(getUrl(vendor), false, common.USER.ADMIN.TOKEN, {
								query: {
									[localCollectionCountries]: {
										__args: {
											sort: 'name',
											filter: { name: { _starts_with: 'country-o2m-top-sort-' } },
										},
										id: true,
									},
								},
							});

							const gqlResponse2 = await requestGraphQL(getUrl(vendor), false, common.USER.ADMIN.TOKEN, {
								query: {
									[localCollectionCountries]: {
										__args: {
											sort: '-name',
											filter: { name: { _starts_with: 'country-o2m-top-sort-' } },
										},
										id: true,
									},
								},
							});

							// Assert
							expect(response.statusCode).toEqual(200);
							expect(response.body.data.length).toBe(5);
							expect(response2.statusCode).toEqual(200);
							expect(response.body.data).toEqual(response2.body.data.reverse());

							expect(gqlResponse.statusCode).toEqual(200);
							expect(gqlResponse.body.data[localCollectionCountries].length).toBe(5);
							expect(gqlResponse2.statusCode).toEqual(200);

							expect(gqlResponse.body.data[localCollectionCountries]).toEqual(
								gqlResponse2.body.data[localCollectionCountries].reverse()
							);
						});
					});

					describe.each([-1, 1, 3])('where limit = %s', (limit) => {
						it.each(vendors)('%s', async (vendor) => {
							// Setup
							const expectedLength = limit === -1 ? 5 : limit;
							const expectedAsc = [1, 2, 3, 4, 5].slice(0, expectedLength);
							const expectedDesc = [5, 4, 3, 2, 1].slice(0, expectedLength);

							// Action
							const response = await request(getUrl(vendor))
								.get(`/items/${localCollectionCountries}`)
								.query({
									sort: 'name',
									filter: { name: { _starts_with: 'country-o2m-top-sort-' } },
									limit,
								})
								.set('Authorization', `Bearer ${common.USER.ADMIN.TOKEN}`);

							const response2 = await request(getUrl(vendor))
								.get(`/items/${localCollectionCountries}`)
								.query({
									sort: '-name',
									filter: { name: { _starts_with: 'country-o2m-top-sort-' } },
									limit,
								})
								.set('Authorization', `Bearer ${common.USER.ADMIN.TOKEN}`);

							const gqlResponse = await requestGraphQL(getUrl(vendor), false, common.USER.ADMIN.TOKEN, {
								query: {
									[localCollectionCountries]: {
										__args: {
											sort: 'name',
											filter: { name: { _starts_with: 'country-o2m-top-sort-' } },
											limit,
										},
										id: true,
										name: true,
									},
								},
							});

							const gqlResponse2 = await requestGraphQL(getUrl(vendor), false, common.USER.ADMIN.TOKEN, {
								query: {
									[localCollectionCountries]: {
										__args: {
											sort: '-name',
											filter: { name: { _starts_with: 'country-o2m-top-sort-' } },
											limit,
										},
										id: true,
										name: true,
									},
								},
							});

							// Assert
							expect(response.statusCode).toEqual(200);
							expect(response.body.data.length).toBe(expectedLength);
							expect(response2.statusCode).toEqual(200);
							expect(response.body.data).not.toEqual(response2.body.data);

							expect(
								response.body.data.map((item: any) => {
									return parseInt(item.name.slice(-1));
								})
							).toEqual(expectedAsc);

							expect(
								response2.body.data.map((item: any) => {
									return parseInt(item.name.slice(-1));
								})
							).toEqual(expectedDesc);

							expect(gqlResponse.statusCode).toEqual(200);
							expect(gqlResponse.body.data[localCollectionCountries].length).toBe(expectedLength);
							expect(gqlResponse2.statusCode).toEqual(200);

							expect(gqlResponse.body.data[localCollectionCountries]).not.toEqual(
								gqlResponse2.body.data[localCollectionCountries]
							);

							expect(
								gqlResponse.body.data[localCollectionCountries].map((item: any) => {
									return parseInt(item.name.slice(-1));
								})
							).toEqual(expectedAsc);

							expect(
								gqlResponse2.body.data[localCollectionCountries].map((item: any) => {
									return parseInt(item.name.slice(-1));
								})
							).toEqual(expectedDesc);
						});
					});
				});

				describe('on o2m level', () => {
					beforeAll(async () => {
						for (const vendor of vendors) {
							// Setup
							const sortValues = [4, 2, 3, 5, 1];

							for (const val of sortValues) {
								const country = createCountry(pkType);
								country.name = 'country-o2m-sort-' + uuid();

								const insertedCountry = await CreateItem(vendor, {
									collection: localCollectionCountries,
									item: country,
								});

								const state = createState(pkType);
								state.name = 'state-o2m-sort-' + val;
								state.country_id = insertedCountry.id;
								await CreateItem(vendor, { collection: localCollectionStates, item: state });
							}
						}
					});

					describe('without limit', () => {
						it.each(vendors)('%s', async (vendor) => {
							// Action
							const response = await request(getUrl(vendor))
								.get(`/items/${localCollectionCountries}`)
								.query({
									sort: 'states.name',
									filter: { name: { _starts_with: 'country-o2m-sort-' } },
								})
								.set('Authorization', `Bearer ${common.USER.ADMIN.TOKEN}`);

							const response2 = await request(getUrl(vendor))
								.get(`/items/${localCollectionCountries}`)
								.query({
									sort: '-states.name',
									filter: { name: { _starts_with: 'country-o2m-sort-' } },
								})
								.set('Authorization', `Bearer ${common.USER.ADMIN.TOKEN}`);

							const gqlResponse = await requestGraphQL(getUrl(vendor), false, common.USER.ADMIN.TOKEN, {
								query: {
									[localCollectionCountries]: {
										__args: {
											sort: 'states.name',
											filter: { name: { _starts_with: 'country-o2m-sort-' } },
										},
										id: true,
									},
								},
							});

							const gqlResponse2 = await requestGraphQL(getUrl(vendor), false, common.USER.ADMIN.TOKEN, {
								query: {
									[localCollectionCountries]: {
										__args: {
											sort: '-states.name',
											filter: { name: { _starts_with: 'country-o2m-sort-' } },
										},
										id: true,
									},
								},
							});

							// Assert
							expect(response.statusCode).toEqual(200);
							expect(response2.statusCode).toEqual(200);
							expect(gqlResponse.statusCode).toEqual(200);
							expect(gqlResponse2.statusCode).toEqual(200);

							// Oddity in MySQL5, looks to be indexing delays resulting in missing values
							if (vendor === 'mysql5') {
								let lastIndex = -1;

								for (const item of response2.body.data.reverse()) {
									const foundIndex = findIndex(response.body.data, { id: item.id });
									if (foundIndex === -1) continue;

									expect(foundIndex).toBeGreaterThan(lastIndex);

									if (foundIndex > lastIndex) {
										lastIndex = foundIndex;
									}
								}

								lastIndex = -1;

								for (const item of gqlResponse2.body.data[localCollectionCountries].reverse()) {
									const foundIndex = findIndex(gqlResponse.body.data[localCollectionCountries], { id: item.id });
									if (foundIndex === -1) continue;

									expect(foundIndex).toBeGreaterThan(lastIndex);

									if (foundIndex > lastIndex) {
										lastIndex = foundIndex;
									}
								}

								return;
							}

							expect(response.body.data.length).toBe(5);
							expect(response.body.data).toEqual(response2.body.data.reverse());
							expect(gqlResponse.body.data[localCollectionCountries].length).toBe(5);

							expect(gqlResponse.body.data[localCollectionCountries]).toEqual(
								gqlResponse2.body.data[localCollectionCountries].reverse()
							);
						});
					});

					describe.each([-1, 1, 3])('where limit = %s', (limit) => {
						it.each(vendors)('%s', async (vendor) => {
							// Setup
							const expectedLength = limit === -1 ? 5 : limit;
							const expectedAsc = [1, 2, 3, 4, 5].slice(0, expectedLength);
							const expectedDesc = [5, 4, 3, 2, 1].slice(0, expectedLength);

							// Action
							const response = await request(getUrl(vendor))
								.get(`/items/${localCollectionCountries}`)
								.query({
									sort: 'states.name',
									filter: { name: { _starts_with: 'country-o2m-sort-' } },
									limit,
									fields: 'states.name',
								})
								.set('Authorization', `Bearer ${common.USER.ADMIN.TOKEN}`);

							const response2 = await request(getUrl(vendor))
								.get(`/items/${localCollectionCountries}`)
								.query({
									sort: '-states.name',
									filter: { name: { _starts_with: 'country-o2m-sort-' } },
									limit,
									fields: 'states.name',
								})
								.set('Authorization', `Bearer ${common.USER.ADMIN.TOKEN}`);

							const gqlResponse = await requestGraphQL(getUrl(vendor), false, common.USER.ADMIN.TOKEN, {
								query: {
									[localCollectionCountries]: {
										__args: {
											sort: 'states.name',
											filter: { name: { _starts_with: 'country-o2m-sort-' } },
											limit,
										},
										id: true,
										states: {
											name: true,
										},
									},
								},
							});

							const gqlResponse2 = await requestGraphQL(getUrl(vendor), false, common.USER.ADMIN.TOKEN, {
								query: {
									[localCollectionCountries]: {
										__args: {
											sort: '-states.name',
											filter: { name: { _starts_with: 'country-o2m-sort-' } },
											limit,
										},
										id: true,
										states: {
											name: true,
										},
									},
								},
							});

							// Assert
							expect(response.statusCode).toEqual(200);
							expect(response2.statusCode).toEqual(200);
							expect(gqlResponse.statusCode).toEqual(200);
							expect(gqlResponse2.statusCode).toEqual(200);

							// Oddity in MySQL5, looks to be indexing delays resulting in missing values
							if (vendor === 'mysql5') {
								for (const data of [
									{ response: response.body.data, expected: expectedAsc },
									{ response: response2.body.data, expected: expectedDesc },
								]) {
									expect(data.response.length).toBeLessThanOrEqual(expectedLength);

									let lastIndex = -1;

									for (const item of data.response) {
										const foundIndex = data.expected.indexOf(parseInt(item.states[0].name.slice(-1)));

										expect(foundIndex).toBeGreaterThan(lastIndex);

										if (foundIndex > lastIndex) {
											lastIndex = foundIndex;
										}
									}
								}

								for (const data of [
									{ response: gqlResponse.body.data[localCollectionCountries], expected: expectedAsc },
									{ response: gqlResponse2.body.data[localCollectionCountries], expected: expectedDesc },
								]) {
									expect(data.response.length).toBeLessThanOrEqual(expectedLength);

									let lastIndex = -1;

									for (const item of data.response) {
										const foundIndex = data.expected.indexOf(parseInt(item.states[0].name.slice(-1)));

										expect(foundIndex).toBeGreaterThan(lastIndex);

										if (foundIndex > lastIndex) {
											lastIndex = foundIndex;
										}
									}
								}

								return;
							}

							expect(response.body.data.length).toBe(expectedLength);
							expect(response.body.data).not.toEqual(response2.body.data);

							expect(
								response.body.data.map((item: any) => {
									return parseInt(item.states[0].name.slice(-1));
								})
							).toEqual(expectedAsc);

							expect(
								response2.body.data.map((item: any) => {
									return parseInt(item.states[0].name.slice(-1));
								})
							).toEqual(expectedDesc);

							expect(gqlResponse.body.data[localCollectionCountries].length).toBe(expectedLength);

							expect(gqlResponse.body.data[localCollectionCountries]).not.toEqual(
								gqlResponse2.body.data[localCollectionCountries]
							);

							expect(
								gqlResponse.body.data[localCollectionCountries].map((item: any) => {
									return parseInt(item.states[0].name.slice(-1));
								})
							).toEqual(expectedAsc);

							expect(
								gqlResponse2.body.data[localCollectionCountries].map((item: any) => {
									return parseInt(item.states[0].name.slice(-1));
								})
							).toEqual(expectedDesc);
						});
					});
				});
			});

			describe('sorts with functions', () => {
				describe('on top level', () => {
					beforeAll(async () => {
						// Setup
						for (const vendor of vendors) {
							const sortValues = [4, 2, 3, 5, 1];
							const countries = [];

							for (const val of sortValues) {
								const country = createCountry(pkType);
								country.name = 'country-o2m-top-sort-fn-' + uuid();

								country.test_datetime = new Date(new Date().setFullYear(parseInt(`202${val}`)))
									.toISOString()
									.slice(0, 19);

								countries.push(country);
							}

							await CreateItem(vendor, {
								collection: localCollectionCountries,
								item: countries,
							});
						}
					});

					describe('without limit', () => {
						it.each(vendors)('%s', async (vendor) => {
							// Action
							const response = await request(getUrl(vendor))
								.get(`/items/${localCollectionCountries}`)
								.query({
									sort: 'year(test_datetime)',
									filter: { name: { _starts_with: 'country-o2m-top-sort-fn-' } },
								})
								.set('Authorization', `Bearer ${common.USER.ADMIN.TOKEN}`);

							const response2 = await request(getUrl(vendor))
								.get(`/items/${localCollectionCountries}`)
								.query({
									sort: '-year(test_datetime)',
									filter: { name: { _starts_with: 'country-o2m-top-sort-fn-' } },
								})
								.set('Authorization', `Bearer ${common.USER.ADMIN.TOKEN}`);

							const gqlResponse = await requestGraphQL(getUrl(vendor), false, common.USER.ADMIN.TOKEN, {
								query: {
									[localCollectionCountries]: {
										__args: {
											sort: 'year(test_datetime)',
											filter: { name: { _starts_with: 'country-o2m-top-sort-fn-' } },
										},
										id: true,
									},
								},
							});

							const gqlResponse2 = await requestGraphQL(getUrl(vendor), false, common.USER.ADMIN.TOKEN, {
								query: {
									[localCollectionCountries]: {
										__args: {
											sort: '-year(test_datetime)',
											filter: { name: { _starts_with: 'country-o2m-top-sort-fn-' } },
										},
										id: true,
									},
								},
							});

							// Assert
							expect(response.statusCode).toEqual(200);
							expect(response.body.data.length).toBe(5);
							expect(response2.statusCode).toEqual(200);
							expect(response.body.data).toEqual(response2.body.data.reverse());

							expect(gqlResponse.statusCode).toEqual(200);
							expect(gqlResponse.body.data[localCollectionCountries].length).toBe(5);
							expect(gqlResponse2.statusCode).toEqual(200);

							expect(gqlResponse.body.data[localCollectionCountries]).toEqual(
								gqlResponse2.body.data[localCollectionCountries].reverse()
							);
						});
					});

					describe.each([-1, 1, 3])('where limit = %s', (limit) => {
						it.each(vendors)('%s', async (vendor) => {
							// Setup
							const expectedLength = limit === -1 ? 5 : limit;
							const expectedAsc = [1, 2, 3, 4, 5].slice(0, expectedLength);
							const expectedDesc = [5, 4, 3, 2, 1].slice(0, expectedLength);

							// Action
							const response = await request(getUrl(vendor))
								.get(`/items/${localCollectionCountries}`)
								.query({
									sort: 'year(test_datetime)',
									filter: { name: { _starts_with: 'country-o2m-top-sort-fn-' } },
									limit,
									fields: 'year(test_datetime)',
								})
								.set('Authorization', `Bearer ${common.USER.ADMIN.TOKEN}`);

							const response2 = await request(getUrl(vendor))
								.get(`/items/${localCollectionCountries}`)
								.query({
									sort: '-year(test_datetime)',
									filter: { name: { _starts_with: 'country-o2m-top-sort-fn-' } },
									limit,
									fields: 'year(test_datetime)',
								})
								.set('Authorization', `Bearer ${common.USER.ADMIN.TOKEN}`);

							const gqlResponse = await requestGraphQL(getUrl(vendor), false, common.USER.ADMIN.TOKEN, {
								query: {
									[localCollectionCountries]: {
										__args: {
											sort: 'year(test_datetime)',
											filter: { name: { _starts_with: 'country-o2m-top-sort-fn-' } },
											limit,
										},
										id: true,
										test_datetime_func: {
											year: true,
										},
									},
								},
							});

							const gqlResponse2 = await requestGraphQL(getUrl(vendor), false, common.USER.ADMIN.TOKEN, {
								query: {
									[localCollectionCountries]: {
										__args: {
											sort: '-year(test_datetime)',
											filter: { name: { _starts_with: 'country-o2m-top-sort-fn-' } },
											limit,
										},
										id: true,
										test_datetime_func: {
											year: true,
										},
									},
								},
							});

							// Assert
							expect(response.statusCode).toEqual(200);
							expect(response.body.data.length).toBe(expectedLength);
							expect(response2.statusCode).toEqual(200);
							expect(response.body.data).not.toEqual(response2.body.data);

							expect(
								response.body.data.map((item: any) => {
									return parseInt(item.test_datetime_year.toString().slice(-1));
								})
							).toEqual(expectedAsc);

							expect(
								response2.body.data.map((item: any) => {
									return parseInt(item.test_datetime_year.toString().slice(-1));
								})
							).toEqual(expectedDesc);

							expect(gqlResponse.statusCode).toEqual(200);
							expect(gqlResponse.body.data[localCollectionCountries].length).toBe(expectedLength);
							expect(gqlResponse2.statusCode).toEqual(200);

							expect(gqlResponse.body.data[localCollectionCountries]).not.toEqual(
								gqlResponse2.body.data[localCollectionCountries]
							);

							expect(
								gqlResponse.body.data[localCollectionCountries].map((item: any) => {
									return parseInt(item.test_datetime_func.year.toString().slice(-1));
								})
							).toEqual(expectedAsc);

							expect(
								gqlResponse2.body.data[localCollectionCountries].map((item: any) => {
									return parseInt(item.test_datetime_func.year.toString().slice(-1));
								})
							).toEqual(expectedDesc);
						});
					});
				});

				describe('on o2m level', () => {
					beforeAll(async () => {
						for (const vendor of vendors) {
							// Setup
							const sortValues = [4, 2, 3, 5, 1];

							for (const val of sortValues) {
								const country = createCountry(pkType);
								country.name = 'country-o2m-sort-fn-' + uuid();

								const insertedCountry = await CreateItem(vendor, {
									collection: localCollectionCountries,
									item: country,
								});

								const state = createState(pkType);
								state.name = 'state-o2m-sort-fn-' + uuid();

								state.test_datetime = new Date(new Date().setFullYear(parseInt(`202${val}`)))
									.toISOString()
									.slice(0, 19);

								state.country_id = insertedCountry.id;
								await CreateItem(vendor, { collection: localCollectionStates, item: state });
							}
						}
					});

					describe('without limit', () => {
						it.each(vendors)('%s', async (vendor) => {
							// Action
							const response = await request(getUrl(vendor))
								.get(`/items/${localCollectionCountries}`)
								.query({
									sort: 'states.year(test_datetime)',
									filter: { name: { _starts_with: 'country-o2m-sort-fn-' } },
								})
								.set('Authorization', `Bearer ${common.USER.ADMIN.TOKEN}`);

							const response2 = await request(getUrl(vendor))
								.get(`/items/${localCollectionCountries}`)
								.query({
									sort: '-states.year(test_datetime)',
									filter: { name: { _starts_with: 'country-o2m-sort-fn-' } },
								})
								.set('Authorization', `Bearer ${common.USER.ADMIN.TOKEN}`);

							const gqlResponse = await requestGraphQL(getUrl(vendor), false, common.USER.ADMIN.TOKEN, {
								query: {
									[localCollectionCountries]: {
										__args: {
											sort: 'states.year(test_datetime)',
											filter: { name: { _starts_with: 'country-o2m-sort-fn-' } },
										},
										id: true,
									},
								},
							});

							const gqlResponse2 = await requestGraphQL(getUrl(vendor), false, common.USER.ADMIN.TOKEN, {
								query: {
									[localCollectionCountries]: {
										__args: {
											sort: '-states.year(test_datetime)',
											filter: { name: { _starts_with: 'country-o2m-sort-fn-' } },
										},
										id: true,
									},
								},
							});

							// Assert
							expect(response.statusCode).toEqual(200);
							expect(response2.statusCode).toEqual(200);
							expect(gqlResponse.statusCode).toEqual(200);
							expect(gqlResponse2.statusCode).toEqual(200);

							// Oddity in MySQL5, looks to be indexing delays resulting in missing values
							if (vendor === 'mysql5') {
								let lastIndex = -1;

								for (const item of response2.body.data.reverse()) {
									const foundIndex = findIndex(response.body.data, { id: item.id });
									if (foundIndex === -1) continue;

									expect(foundIndex).toBeGreaterThan(lastIndex);

									if (foundIndex > lastIndex) {
										lastIndex = foundIndex;
									}
								}

								lastIndex = -1;

								for (const item of gqlResponse2.body.data[localCollectionCountries].reverse()) {
									const foundIndex = findIndex(gqlResponse.body.data[localCollectionCountries], { id: item.id });
									if (foundIndex === -1) continue;

									expect(foundIndex).toBeGreaterThan(lastIndex);

									if (foundIndex > lastIndex) {
										lastIndex = foundIndex;
									}
								}

								return;
							}

							expect(response.body.data.length).toBe(5);
							expect(response.body.data).toEqual(response2.body.data.reverse());
							expect(gqlResponse.body.data[localCollectionCountries].length).toBe(5);

							expect(gqlResponse.body.data[localCollectionCountries]).toEqual(
								gqlResponse2.body.data[localCollectionCountries].reverse()
							);
						});
					});

					describe.each([-1, 1, 3])('where limit = %s', (limit) => {
						it.each(vendors)('%s', async (vendor) => {
							// Setup
							const expectedLength = limit === -1 ? 5 : limit;
							const expectedAsc = [1, 2, 3, 4, 5].slice(0, expectedLength);
							const expectedDesc = [5, 4, 3, 2, 1].slice(0, expectedLength);

							// Action
							const response = await request(getUrl(vendor))
								.get(`/items/${localCollectionCountries}`)
								.query({
									sort: 'states.year(test_datetime)',
									filter: { name: { _starts_with: 'country-o2m-sort-fn-' } },
									limit,
									fields: 'states.year(test_datetime)',
								})
								.set('Authorization', `Bearer ${common.USER.ADMIN.TOKEN}`);

							const response2 = await request(getUrl(vendor))
								.get(`/items/${localCollectionCountries}`)
								.query({
									sort: '-states.year(test_datetime)',
									filter: { name: { _starts_with: 'country-o2m-sort-fn-' } },
									limit,
									fields: 'states.year(test_datetime)',
								})
								.set('Authorization', `Bearer ${common.USER.ADMIN.TOKEN}`);

							const gqlResponse = await requestGraphQL(getUrl(vendor), false, common.USER.ADMIN.TOKEN, {
								query: {
									[localCollectionCountries]: {
										__args: {
											sort: 'states.year(test_datetime)',
											filter: { name: { _starts_with: 'country-o2m-sort-fn-' } },
											limit,
										},
										id: true,
										states: {
											test_datetime_func: {
												year: true,
											},
										},
									},
								},
							});

							const gqlResponse2 = await requestGraphQL(getUrl(vendor), false, common.USER.ADMIN.TOKEN, {
								query: {
									[localCollectionCountries]: {
										__args: {
											sort: '-states.year(test_datetime)',
											filter: { name: { _starts_with: 'country-o2m-sort-fn-' } },
											limit,
										},
										id: true,
										states: {
											test_datetime_func: {
												year: true,
											},
										},
									},
								},
							});

							// Assert
							expect(response.statusCode).toEqual(200);
							expect(response2.statusCode).toEqual(200);
							expect(gqlResponse.statusCode).toEqual(200);
							expect(gqlResponse2.statusCode).toEqual(200);

							if (vendor === 'mysql5') {
								for (const data of [
									{ response: response.body.data, expected: expectedAsc },
									{ response: response2.body.data, expected: expectedDesc },
								]) {
									expect(data.response.length).toBeLessThanOrEqual(expectedLength);

									let lastIndex = -1;

									for (const item of data.response) {
										const foundIndex = data.expected.indexOf(
											parseInt(item.states[0].test_datetime_year.toString().slice(-1))
										);

										expect(foundIndex).toBeGreaterThan(lastIndex);

										if (foundIndex > lastIndex) {
											lastIndex = foundIndex;
										}
									}
								}

								for (const data of [
									{ response: gqlResponse.body.data[localCollectionCountries], expected: expectedAsc },
									{ response: gqlResponse2.body.data[localCollectionCountries], expected: expectedDesc },
								]) {
									expect(data.response.length).toBeLessThanOrEqual(expectedLength);

									let lastIndex = -1;

									for (const item of data.response) {
										const foundIndex = data.expected.indexOf(
											parseInt(item.states[0].test_datetime_func.year.toString().slice(-1))
										);

										expect(foundIndex).toBeGreaterThan(lastIndex);

										if (foundIndex > lastIndex) {
											lastIndex = foundIndex;
										}
									}
								}

								return;
							}

							expect(response.body.data.length).toBe(expectedLength);
							expect(response.body.data).not.toEqual(response2.body.data);

							expect(
								response.body.data.map((item: any) => {
									return parseInt(item.states[0].test_datetime_year.toString().slice(-1));
								})
							).toEqual(expectedAsc);

							expect(
								response2.body.data.map((item: any) => {
									return parseInt(item.states[0].test_datetime_year.toString().slice(-1));
								})
							).toEqual(expectedDesc);

							expect(gqlResponse.body.data[localCollectionCountries].length).toBe(expectedLength);

							expect(gqlResponse.body.data[localCollectionCountries]).not.toEqual(
								gqlResponse2.body.data[localCollectionCountries]
							);

							expect(
								gqlResponse.body.data[localCollectionCountries].map((item: any) => {
									return parseInt(item.states[0].test_datetime_func.year.toString().slice(-1));
								})
							).toEqual(expectedAsc);

							expect(
								gqlResponse2.body.data[localCollectionCountries].map((item: any) => {
									return parseInt(item.states[0].test_datetime_func.year.toString().slice(-1));
								})
							).toEqual(expectedDesc);
						});
					});
				});
			});

			CheckQueryFilters(
				{
					method: 'get',
					path: `/items/${localCollectionCountries}`,
					token: common.USER.ADMIN.TOKEN,
				},
				localCollectionCountries,
				cachedSchema[pkType][localCollectionCountries],
				vendorSchemaValues
			);

			CheckQueryFilters(
				{
					method: 'get',
					path: `/items/${localCollectionStates}`,
					token: common.USER.ADMIN.TOKEN,
				},
				localCollectionStates,
				cachedSchema[pkType][localCollectionStates],
				vendorSchemaValues
			);

			CheckQueryFilters(
				{
					method: 'get',
					path: `/items/${localCollectionCities}`,
					token: common.USER.ADMIN.TOKEN,
				},
				localCollectionCities,
				cachedSchema[pkType][localCollectionCities],
				vendorSchemaValues
			);
		});

		describe('Returns no duplicated results from joins', () => {
			it.each(vendors)('%s', async (vendor) => {
				// Setup
				await CreateItem(vendor, {
					collection: localCollectionCountries,
					item: {
						...createCountry(pkType),
						name: 'test_country_duplicates',
						states: {
							create: [
								{
									...createState(pkType),
									name: 'test_state_duplicates_1',
								},
								{
									...createState(pkType),
									name: 'test_state_duplicates_2',
								},
							],
							update: [],
							delete: [],
						},
					},
				});

				// Action
				const responseO2m = await request(getUrl(vendor))
					.get(`/items/${localCollectionCountries}`)
					.query({
						filter: JSON.stringify({
							_and: [
								{
									name: { _eq: 'test_country_duplicates' },
								},
								{
									states: {
										country_id: {
											id: { _nnull: true },
										},
									},
								},
							],
						}),
					})
					.set('Authorization', `Bearer ${common.USER.ADMIN.TOKEN}`);

				const responseM2o = await request(getUrl(vendor))
					.get(`/items/${localCollectionStates}`)
					.query({
						filter: JSON.stringify({
							_and: [
								{
									name: { _starts_with: 'test_state_duplicates' },
								},
								{
									country_id: {
										states: {
											id: { _nnull: true },
										},
									},
								},
							],
						}),
					})
					.set('Authorization', `Bearer ${common.USER.ADMIN.TOKEN}`);

				const gqlResponseO2m = await requestGraphQL(getUrl(vendor), false, common.USER.ADMIN.TOKEN, {
					query: {
						[localCollectionCountries]: {
							__args: {
								filter: {
									_and: [
										{
											name: { _eq: 'test_country_duplicates' },
										},
										{
											states: {
												country_id: {
													id: { _nnull: true },
												},
											},
										},
									],
								},
							},
							id: true,
						},
					},
				});

				const gqlResponseM2o = await requestGraphQL(getUrl(vendor), false, common.USER.ADMIN.TOKEN, {
					query: {
						[localCollectionStates]: {
							__args: {
								filter: {
									_and: [
										{
											name: { _starts_with: 'test_state_duplicates' },
										},
										{
											country_id: {
												states: {
													id: { _nnull: true },
												},
											},
										},
									],
								},
							},
							id: true,
						},
					},
				});

				// Assert
				expect(responseO2m.statusCode).toEqual(200);
				expect(responseO2m.body.data.length).toEqual(1);
				expect(responseM2o.statusCode).toEqual(200);
				expect(responseM2o.body.data.length).toEqual(2);

				expect(gqlResponseO2m.statusCode).toEqual(200);
				expect(gqlResponseO2m.body.data[localCollectionCountries].length).toEqual(1);
				expect(gqlResponseM2o.statusCode).toEqual(200);
				expect(gqlResponseM2o.body.data[localCollectionStates].length).toEqual(2);
			});
		});

		describe('Aggregation Tests', () => {
			describe('retrieves relational count correctly', () => {
				it.each(vendors)('%s', async (vendor) => {
					// Setup
					const count = 8;
					const country = createCountry(pkType);
					const states = [];

					for (let i = 0; i < count; i++) {
						states.push(createState(pkType));
					}

					await CreateItem(vendor, {
						collection: localCollectionCountries,
						item: {
							...country,
							states: {
								create: states,
								update: [],
								delete: [],
							},
						},
					});

					// Action
					const response = await request(getUrl(vendor))
						.get(`/items/${localCollectionCountries}`)
						.query({
							filter: {
								name: { _eq: country.name },
							},
							fields: 'count(states)',
						})
						.set('Authorization', `Bearer ${common.USER.ADMIN.TOKEN}`);

					const gqlResponse = await requestGraphQL(getUrl(vendor), false, common.USER.ADMIN.TOKEN, {
						query: {
							[localCollectionCountries]: {
								__args: {
									filter: {
										name: { _eq: country.name },
									},
								},
								states_func: {
									count: true,
								},
							},
						},
					});

					// Assert
					expect(response.statusCode).toBe(200);
					expect(response.body.data[0].states_count == count).toBeTruthy();

					expect(gqlResponse.statusCode).toBe(200);
					expect(gqlResponse.body.data[localCollectionCountries][0].states_func.count).toEqual(count);
				});
			});
		});

		describe('Offset Tests', () => {
			describe('retrieves relational offset correctly', () => {
				it.each(vendors)('%s', async (vendor) => {
					// Setup
					const count = 5;
					const offset = 2;
					const country = createCountry(pkType);
					const states = [];

					for (let i = 0; i < count; i++) {
						states.push(createState(pkType));
					}

					await CreateItem(vendor, {
						collection: localCollectionCountries,
						item: {
							...country,
							states: {
								create: states,
								update: [],
								delete: [],
							},
						},
					});

					// Action
					const response = await request(getUrl(vendor))
						.get(`/items/${localCollectionCountries}`)
						.query({
							filter: JSON.stringify({
								name: { _eq: country.name },
							}),
							deep: JSON.stringify({
								states: {
									_offset: offset,
								},
							}),
						})
						.set('Authorization', `Bearer ${common.USER.ADMIN.TOKEN}`);

					const gqlResponse = await requestGraphQL(getUrl(vendor), false, common.USER.ADMIN.TOKEN, {
						query: {
							[localCollectionCountries]: {
								__args: {
									filter: {
										name: { _eq: country.name },
									},
								},
								states: {
									__args: {
										offset,
									},
									id: true,
								},
							},
						},
					});

					// Assert
					expect(response.statusCode).toBe(200);
					expect(response.body.data.length).toBe(1);
					expect(response.body.data[0].states.length).toBe(states.length - offset);

					expect(gqlResponse.statusCode).toBe(200);
					expect(gqlResponse.body.data[localCollectionCountries].length).toEqual(1);
					expect(gqlResponse.body.data[localCollectionCountries][0].states.length).toEqual(count - offset);
				});
			});

			describe('retrieves offset with limit and sort correctly', () => {
				it.each(vendors)('%s', async (vendor) => {
					// Setup
					const count = 8;
					const offset = 3;
					const limit = 4;
					const sort = 'name';
					const country = createCountry(pkType);
					const states = [];
					const expectedResultAsc = Array.from(Array(count).keys()).slice(offset, offset + limit);

					const expectedResultDesc = Array.from(Array(count).keys())
						.sort((v) => -v)
						.slice(offset, offset + limit);

					for (let i = 0; i < count; i++) {
						const state = createState(pkType);
						state.name = `${i}-${state.name}`;
						states.push(state);
					}

					await CreateItem(vendor, {
						collection: localCollectionCountries,
						item: {
							...country,
							states: {
								create: states,
								update: [],
								delete: [],
							},
						},
					});

					// Action
					const responseAsc = await request(getUrl(vendor))
						.get(`/items/${localCollectionCountries}`)
						.query({
							fields: '*.*',
							filter: JSON.stringify({
								name: { _eq: country.name },
							}),
							deep: JSON.stringify({
								states: {
									_offset: offset,
									_limit: limit,
									_sort: sort,
								},
							}),
						})
						.set('Authorization', `Bearer ${common.USER.ADMIN.TOKEN}`);

					const gqlResponseAsc = await requestGraphQL(getUrl(vendor), false, common.USER.ADMIN.TOKEN, {
						query: {
							[localCollectionCountries]: {
								__args: {
									filter: {
										name: { _eq: country.name },
									},
								},
								states: {
									__args: {
										offset,
										limit,
										sort,
									},
									id: true,
									name: true,
								},
							},
						},
					});

					const responseDesc = await request(getUrl(vendor))
						.get(`/items/${localCollectionCountries}`)
						.query({
							fields: '*.*',
							filter: JSON.stringify({
								name: { _eq: country.name },
							}),
							deep: JSON.stringify({
								states: {
									_offset: offset,
									_limit: limit,
									_sort: sort,
								},
							}),
						})
						.set('Authorization', `Bearer ${common.USER.ADMIN.TOKEN}`);

					const gqlResponseDesc = await requestGraphQL(getUrl(vendor), false, common.USER.ADMIN.TOKEN, {
						query: {
							[localCollectionCountries]: {
								__args: {
									filter: {
										name: { _eq: country.name },
									},
								},
								states: {
									__args: {
										offset,
										limit,
										sort: `-${sort}`,
									},
									id: true,
									name: true,
								},
							},
						},
					});

					// Assert
					expect(responseAsc.statusCode).toBe(200);
					expect(responseAsc.body.data.length).toBe(1);
					expect(responseAsc.body.data[0].states.length).toBe(limit);

					expect(responseAsc.body.data[0].states.map((v: any) => parseInt(v.name.split('-')[0]))).toEqual(
						expectedResultAsc
					);

					expect(gqlResponseAsc.statusCode).toBe(200);
					expect(gqlResponseAsc.body.data[localCollectionCountries].length).toEqual(1);
					expect(gqlResponseAsc.body.data[localCollectionCountries][0].states.length).toEqual(limit);

					expect(
						gqlResponseAsc.body.data[localCollectionCountries][0].states.map((v: any) => parseInt(v.name.split('-')[0]))
					).toEqual(expectedResultAsc);

					expect(responseDesc.statusCode).toBe(200);
					expect(responseDesc.body.data.length).toBe(1);
					expect(responseDesc.body.data[0].states.length).toBe(limit);

					expect(responseDesc.body.data[0].states.map((v: any) => parseInt(v.name.split('-')[0]))).toEqual(
						expectedResultAsc
					);

					expect(gqlResponseDesc.statusCode).toBe(200);
					expect(gqlResponseDesc.body.data[localCollectionCountries].length).toEqual(1);
					expect(gqlResponseDesc.body.data[localCollectionCountries][0].states.length).toEqual(limit);

					expect(
						gqlResponseDesc.body.data[localCollectionCountries][0].states.map((v: any) =>
							parseInt(v.name.split('-')[0])
						)
					).toEqual(expectedResultDesc);
				});
			});
		});

		describe('MAX_BATCH_MUTATION Tests', () => {
			describe('createOne', () => {
				describe('passes when below limit', () => {
					it.each(vendors)(
						'%s',
						async (vendor) => {
							// TODO: Fix Oracle exceeded directus_revisions limit of 4000
							if (vendor === 'oracle') {
								expect(true).toBe(true);
								return;
							}

							// Setup
							const countNested = Number(config.envs[vendor].MAX_BATCH_MUTATION) - 1;
							const country: any = createCountry(pkType);
							const country2: any = createCountry(pkType);

							country.states = Array(countNested)
								.fill(0)
								.map(() => createState(pkType));

							country2.states = Array(countNested)
								.fill(0)
								.map(() => createState(pkType));

							// Action
							const response = await request(getUrl(vendor))
								.post(`/items/${localCollectionCountries}`)
								.send(country)
								.set('Authorization', `Bearer ${common.USER.ADMIN.TOKEN}`);

							const mutationKey = `create_${localCollectionCountries}_item`;

							const gqlResponse = await requestGraphQL(getUrl(vendor), false, common.USER.ADMIN.TOKEN, {
								mutation: {
									[mutationKey]: {
										__args: {
											data: country2,
										},
										id: true,
										states: {
											id: true,
										},
									},
								},
							});

							// Assert
							expect(response.statusCode).toBe(200);
							expect(response.body.data.states.length).toBe(countNested);

							expect(gqlResponse.statusCode).toBe(200);
							expect(gqlResponse.body.data[mutationKey].states.length).toEqual(countNested);
						},
						120000
					);
				});

				describe('errors when above limit', () => {
					it.each(vendors)(
						'%s',
						async (vendor) => {
							// TODO: Fix Oracle ORA-01086 savepoint never established in this session or is invalid
							if (vendor === 'oracle') {
								expect(true).toBe(true);
								return;
							}

							// Setup
							const countNested = Number(config.envs[vendor].MAX_BATCH_MUTATION);
							const country: any = createCountry(pkType);
							const country2: any = createCountry(pkType);

							country.states = Array(countNested)
								.fill(0)
								.map(() => createState(pkType));

							country2.states = Array(countNested)
								.fill(0)
								.map(() => createState(pkType));

							// Action
							const response = await request(getUrl(vendor))
								.post(`/items/${localCollectionCountries}`)
								.send(country)
								.set('Authorization', `Bearer ${common.USER.ADMIN.TOKEN}`);

							const mutationKey = `create_${localCollectionCountries}_item`;

							const gqlResponse = await requestGraphQL(getUrl(vendor), false, common.USER.ADMIN.TOKEN, {
								mutation: {
									[mutationKey]: {
										__args: {
											data: country2,
										},
										id: true,
										states: {
											id: true,
										},
									},
								},
							});

							// Assert
							expect(response.statusCode).toBe(400);
							expect(response.body.errors).toBeDefined();

							expect(response.body.errors[0].message).toBe(
								`Exceeded max batch mutation limit of ${config.envs[vendor].MAX_BATCH_MUTATION}.`
							);

							expect(gqlResponse.statusCode).toBe(200);
							expect(gqlResponse.body.errors).toBeDefined();

							expect(gqlResponse.body.errors[0].message).toBe(
								`Exceeded max batch mutation limit of ${config.envs[vendor].MAX_BATCH_MUTATION}.`
							);
						},
						120000
					);
				});
			});

			describe('createMany', () => {
				describe('passes when below limit', () => {
					it.each(vendors)(
						'%s',
						async (vendor) => {
							// Setup
							const count = Number(config.envs[vendor].MAX_BATCH_MUTATION) / 10;
							const countNested = 9;
							const countries: any[] = [];
							const countries2: any[] = [];

							for (let i = 0; i < count; i++) {
								countries.push(createCountry(pkType));

								countries[i].states = Array(countNested)
									.fill(0)
									.map(() => createState(pkType));

								countries2.push(createCountry(pkType));

								countries2[i].states = Array(countNested)
									.fill(0)
									.map(() => createState(pkType));
							}

							// Action
							const response = await request(getUrl(vendor))
								.post(`/items/${localCollectionCountries}`)
								.send(countries)
								.set('Authorization', `Bearer ${common.USER.ADMIN.TOKEN}`);

							const mutationKey = `create_${localCollectionCountries}_items`;

							const gqlResponse = await requestGraphQL(getUrl(vendor), false, common.USER.ADMIN.TOKEN, {
								mutation: {
									[mutationKey]: {
										__args: {
											data: countries2,
										},
										id: true,
									},
								},
							});

							// Assert
							expect(response.statusCode).toBe(200);
							expect(response.body.data.length).toBe(count);

							expect(gqlResponse.statusCode).toBe(200);
							expect(gqlResponse.body.data[mutationKey].length).toEqual(count);
						},
						120000
					);
				});

				describe('errors when above limit', () => {
					it.each(vendors)(
						'%s',
						async (vendor) => {
							// TODO: Fix Oracle ORA-01086 savepoint never established in this session or is invalid
							if (vendor === 'oracle') {
								expect(true).toBe(true);
								return;
							}

							// Setup
							const count = Number(config.envs[vendor].MAX_BATCH_MUTATION) / 10;
							const countNested = 10;
							const countries: any[] = [];
							const countries2: any[] = [];

							for (let i = 0; i < count; i++) {
								countries.push(createCountry(pkType));

								countries[i].states = Array(countNested)
									.fill(0)
									.map(() => createState(pkType));

								countries2.push(createCountry(pkType));

								countries2[i].states = Array(countNested)
									.fill(0)
									.map(() => createState(pkType));
							}

							// Action
							const response = await request(getUrl(vendor))
								.post(`/items/${localCollectionCountries}`)
								.send(countries)
								.set('Authorization', `Bearer ${common.USER.ADMIN.TOKEN}`);

							const mutationKey = `create_${localCollectionCountries}_items`;

							const gqlResponse = await requestGraphQL(getUrl(vendor), false, common.USER.ADMIN.TOKEN, {
								mutation: {
									[mutationKey]: {
										__args: {
											data: countries2,
										},
										id: true,
									},
								},
							});

							// Assert
							expect(response.statusCode).toBe(400);
							expect(response.body.errors).toBeDefined();

							expect(response.body.errors[0].message).toBe(
								`Exceeded max batch mutation limit of ${config.envs[vendor].MAX_BATCH_MUTATION}.`
							);

							expect(gqlResponse.statusCode).toBe(200);
							expect(gqlResponse.body.errors).toBeDefined();

							expect(gqlResponse.body.errors[0].message).toBe(
								`Exceeded max batch mutation limit of ${config.envs[vendor].MAX_BATCH_MUTATION}.`
							);
						},
						120000
					);
				});
			});

			describe('updateBatch', () => {
				describe('passes when below limit', () => {
					it.each(vendors)(
						'%s',
						async (vendor) => {
							// Setup
							const count = Number(config.envs[vendor].MAX_BATCH_MUTATION) / 10;
							const countCreate = 4;
							const countUpdate = 3;
							const countDelete = 2;
							const countriesID = [];
							const countriesID2 = [];

							for (let i = 0; i < count; i++) {
								const country: any = createCountry(pkType);

								country.states = Array(countUpdate + countDelete)
									.fill(0)
									.map(() => createState(pkType));

								countriesID.push(
									(await CreateItem(vendor, { collection: localCollectionCountries, item: country })).id
								);

								const country2: any = createCountry(pkType);

								country2.states = Array(countUpdate + countDelete)
									.fill(0)
									.map(() => createState(pkType));

								countriesID2.push(
									(await CreateItem(vendor, { collection: localCollectionCountries, item: country2 })).id
								);
							}

							const countries = await ReadItem(vendor, {
								collection: localCollectionCountries,
								fields: ['*', 'states.id', 'states.name'],
								filter: { id: { _in: countriesID } },
							});

							const countries2 = await ReadItem(vendor, {
								collection: localCollectionCountries,
								fields: ['*', 'states.id', 'states.name'],
								filter: { id: { _in: countriesID2 } },
							});

							for (const country of countries) {
								const states = country.states;

								country.states = {
									create: Array(countCreate)
										.fill(0)
										.map(() => createState(pkType)),
									update: states.slice(0, countUpdate),
									delete: states.slice(-countDelete).map((state: State) => state.id),
								};
							}

							for (const country of countries2) {
								country.states = [
									...country.states,
									...Array(countCreate)
										.fill(0)
										.map(() => createState(pkType)),
								];
							}

							// Action
							const response = await request(getUrl(vendor))
								.patch(`/items/${localCollectionCountries}`)
								.send(countries)
								.set('Authorization', `Bearer ${common.USER.ADMIN.TOKEN}`);

							const mutationKey = `update_${localCollectionCountries}_batch`;

							const gqlResponse = await requestGraphQL(getUrl(vendor), false, common.USER.ADMIN.TOKEN, {
								mutation: {
									[mutationKey]: {
										__args: {
											data: countries2,
										},
										id: true,
									},
								},
							});

							// Assert
							expect(response.statusCode).toBe(200);
							expect(response.body.data.length).toBe(count);

							expect(gqlResponse.statusCode).toBe(200);
							expect(gqlResponse.body.data[mutationKey].length).toEqual(count);
						},
						120000
					);
				});

				describe('errors when above limit', () => {
					it.each(vendors)(
						'%s',
						async (vendor) => {
							// TODO: Fix Oracle ORA-01086 savepoint never established in this session or is invalid
							if (vendor === 'oracle') {
								expect(true).toBe(true);
								return;
							}

							// Setup
							const count = Number(config.envs[vendor].MAX_BATCH_MUTATION) / 10;
							const countCreate = 4;
							const countUpdate = 3;
							const countDelete = 3;
							const countriesID = [];
							const countriesID2 = [];

							for (let i = 0; i < count; i++) {
								const country: any = createCountry(pkType);

								country.states = Array(countUpdate + countDelete)
									.fill(0)
									.map(() => createState(pkType));

								countriesID.push(
									(await CreateItem(vendor, { collection: localCollectionCountries, item: country })).id
								);

								const country2: any = createCountry(pkType);

								country2.states = Array(countUpdate + countDelete)
									.fill(0)
									.map(() => createState(pkType));

								countriesID2.push(
									(await CreateItem(vendor, { collection: localCollectionCountries, item: country2 })).id
								);
							}

							const countries = await ReadItem(vendor, {
								collection: localCollectionCountries,
								fields: ['*', 'states.id', 'states.name'],
								filter: { id: { _in: countriesID } },
							});

							const countries2 = await ReadItem(vendor, {
								collection: localCollectionCountries,
								fields: ['*', 'states.id', 'states.name'],
								filter: { id: { _in: countriesID2 } },
							});

							for (const country of countries) {
								const states = country.states;

								country.states = {
									create: Array(countCreate)
										.fill(0)
										.map(() => createState(pkType)),
									update: states.slice(0, countUpdate),
									delete: states.slice(-countDelete).map((state: State) => state.id),
								};
							}

							for (const country of countries2) {
								country.states = [
									...country.states,
									...Array(countCreate)
										.fill(0)
										.map(() => createState(pkType)),
								];
							}

							// Action
							const response = await request(getUrl(vendor))
								.patch(`/items/${localCollectionCountries}`)
								.send(countries)
								.set('Authorization', `Bearer ${common.USER.ADMIN.TOKEN}`);

							const mutationKey = `update_${localCollectionCountries}_batch`;

							const gqlResponse = await requestGraphQL(getUrl(vendor), false, common.USER.ADMIN.TOKEN, {
								mutation: {
									[mutationKey]: {
										__args: {
											data: countries2,
										},
										id: true,
									},
								},
							});

							// Assert
							expect(response.statusCode).toBe(400);
							expect(response.body.errors).toBeDefined();

							expect(response.body.errors[0].message).toBe(
								`Exceeded max batch mutation limit of ${config.envs[vendor].MAX_BATCH_MUTATION}.`
							);

							expect(gqlResponse.statusCode).toBe(200);
							expect(gqlResponse.body.errors).toBeDefined();

							expect(gqlResponse.body.errors[0].message).toBe(
								`Exceeded max batch mutation limit of ${config.envs[vendor].MAX_BATCH_MUTATION}.`
							);
						},
						120000
					);
				});
			});
		});
	});
});
