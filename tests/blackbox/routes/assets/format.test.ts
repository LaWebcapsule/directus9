import { getUrl } from '@common/config';
import request, { type Response } from 'supertest';
import vendors from '@common/get-dbs-to-test';
import { createReadStream } from 'fs';
import path from 'path';
import * as common from '@common/index';
import { sleep } from '@utils/sleep';

const assetsDirectory = [__dirname, '..', '..', 'assets'];
const storages = ['local', 'minio'];

const imageFile = {
	name: 'directus.png',
	type: 'image/png',
	filesize: '7136',
};

const imageFilePath = path.join(...assetsDirectory, imageFile.name);

describe('/assets', () => {
	describe('GET /assets/:id', () => {
		describe('format=auto Tests', () => {
			describe('without Accept request header', () => {
				describe.each(storages)('Storage: %s', (storage) => {
					it.each(vendors)('%s', async (vendor) => {
						// Setup
						const insertResponse = await request(getUrl(vendor))
							.post('/files')
							.set('Authorization', `Bearer ${common.USER.ADMIN.TOKEN}`)
							.field('storage', storage)
							.attach('file', createReadStream(imageFilePath));

						// Action
						const response = await request(getUrl(vendor))
							.get(`/assets/${insertResponse.body.data.id}?format=auto`)
							.set('Authorization', `Bearer ${common.USER.ADMIN.TOKEN}`);

						// Assert
						expect(response.statusCode).toBe(200);
						expect(response.headers['content-type']).toBe('image/jpeg'); // Expect fallback to jpg as default
					});
				});
			});

			describe.each([
				{ requestHeaderAccept: 'image/avif,image/webp,image/*,*/*;q=0.8', responseHeaderContentType: 'image/avif' },
				{ requestHeaderAccept: 'image/avif', responseHeaderContentType: 'image/avif' },
				{ requestHeaderAccept: 'image/webp', responseHeaderContentType: 'image/webp' },
				{ requestHeaderAccept: '*/*', responseHeaderContentType: 'image/jpeg' },
			])('with "$requestHeaderAccept" Accept request header', ({ requestHeaderAccept, responseHeaderContentType }) => {
				describe.each(storages)('Storage: %s', (storage) => {
					it.each(vendors)(
						'%s',
						async (vendor) => {
							// Setup
							const insertResponse = await request(getUrl(vendor))
								.post('/files')
								.set('Authorization', `Bearer ${common.USER.ADMIN.TOKEN}`)
								.field('storage', storage)
								.attach('file', createReadStream(imageFilePath));

							// These tests fails often with an 503 error (server too busy)
							// Workaround to retry until server responds
							let finalResponse: Response | undefined;

							while (!finalResponse) {
								// Action
								const response = await request(getUrl(vendor))
									.get(`/assets/${insertResponse.body.data.id}?format=auto`)
									.set('Authorization', `Bearer ${common.USER.ADMIN.TOKEN}`)
									.set('Accept', requestHeaderAccept);

								if (response.statusCode === 503) {
									// Server is busy. Retrying...
									await sleep(2000);
								} else {
									finalResponse = response;
								}
							}

							// Assert
							expect(finalResponse.statusCode).toBe(200);
							expect(finalResponse.headers['content-type']).toBe(responseHeaderContentType);
						},
						30000
					);
				});
			});
		});
	});
});
