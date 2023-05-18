import { getUrl } from '@common/config';
import request from 'supertest';
import vendors from '@common/get-dbs-to-test';
import { createReadStream } from 'fs';
import path from 'path';
import * as common from '@common/index';

const assetsDirectory = [__dirname, '..', '..', 'assets'];
const storages = ['local', 'minio'];

const imageFile = {
	name: 'directus9.png',
	type: 'image/png',
	filesize: '7136',
	title: 'Directus9',
	description: 'The Directus9 Logo',
};

const imageFilePath = path.join(...assetsDirectory, imageFile.name);

describe('/files', () => {
	describe('POST /files', () => {
		describe.each(storages)('Storage: %s', (storage) => {
			it.each(vendors)('%s', async (vendor) => {
				// Action
				const response = await request(getUrl(vendor))
					.post('/files')
					.set('Authorization', `Bearer ${common.USER.ADMIN.TOKEN}`)
					.field('storage', storage)
					.field('title', imageFile.title)
					.field('description', imageFile.description)
					.attach('file', createReadStream(imageFilePath));

				// Normalize filesize to string as bigint returns as a string
				response.body.data.filesize = String(response.body.data.filesize);

				// Assert
				expect(response.statusCode).toBe(200);

				expect(response.body.data).toEqual(
					expect.objectContaining({
						filesize: imageFile.filesize,
						type: imageFile.type,
						filename_download: imageFile.name,
						filename_disk: expect.any(String),
						storage: storage,
						title: imageFile.title,
						description: imageFile.description,
						id: expect.any(String),
					})
				);
			});
		});
	});

	describe('DELETE /files/:id', () => {
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
					.delete(`/files/${insertResponse.body.data.id}`)
					.set('Authorization', `Bearer ${common.USER.ADMIN.TOKEN}`);

				// Assert
				expect(response.statusCode).toEqual(204);
				expect(response.body.data).toBe(undefined);
			});
		});
	});
});
