import config, { Env, getUrl, paths } from '@common/config';
import vendors from '@common/get-dbs-to-test';
import * as common from '@common/index';
import { awaitDirectus9Connection } from '@utils/await-connection';
import { ChildProcess, spawn } from 'child_process';
import type { Knex } from 'knex';
import knex from 'knex';
import { cloneDeep } from 'lodash';
import request from 'supertest';

describe('Schema Caching Tests', () => {
	const databases = new Map<string, Knex>();
	const tzDirectus9 = {} as { [vendor: string]: ChildProcess[] };
	const envs = {} as { [vendor: string]: Env[] };
	const newCollectionName = 'schema-caching-test';

	beforeAll(async () => {
		const promises = [];

		for (const vendor of vendors) {
			databases.set(vendor, knex(config.knexConfig[vendor]!));

			const env1 = cloneDeep(config.envs);
			env1[vendor].CACHE_ENABLED = 'true';
			env1[vendor].CACHE_AUTO_PURGE = 'true';
			env1[vendor].CACHE_SCHEMA = 'true';
			env1[vendor].CACHE_STORE = 'memory';
			env1[vendor].CACHE_NAMESPACE = 'directus9-schema-cache';
			env1[vendor].MESSENGER_STORE = 'redis';
			env1[vendor].MESSENGER_NAMESPACE = `directus9-${vendor}`;
			env1[vendor].MESSENGER_REDIS = `redis://localhost:6108/4`;

			const env2 = cloneDeep(env1);
			env2[vendor].CACHE_NAMESPACE = env1[vendor].CACHE_NAMESPACE + '2';

			const env3 = cloneDeep(env1);
			env3[vendor].CACHE_NAMESPACE = env1[vendor].CACHE_NAMESPACE + '3';
			delete env3[vendor].MESSENGER_STORE;
			delete env3[vendor].MESSENGER_NAMESPACE;
			delete env3[vendor].MESSENGER_REDIS;

			const env4 = cloneDeep(env3);
			env4[vendor].CACHE_NAMESPACE = env1[vendor].CACHE_NAMESPACE + '4';

			const newServerPort1 = Number(env1[vendor]!.PORT) + 150;
			const newServerPort2 = Number(env2[vendor]!.PORT) + 200;
			const newServerPort3 = Number(env3[vendor]!.PORT) + 250;
			const newServerPort4 = Number(env4[vendor]!.PORT) + 300;

			env1[vendor]!.PORT = String(newServerPort1);
			env2[vendor]!.PORT = String(newServerPort2);
			env3[vendor]!.PORT = String(newServerPort3);
			env4[vendor]!.PORT = String(newServerPort4);

			const server1 = spawn('node', [paths.cli, 'start'], { cwd: paths.cwd, env: env1[vendor] });
			const server2 = spawn('node', [paths.cli, 'start'], { cwd: paths.cwd, env: env2[vendor] });
			const server3 = spawn('node', [paths.cli, 'start'], { cwd: paths.cwd, env: env3[vendor] });
			const server4 = spawn('node', [paths.cli, 'start'], { cwd: paths.cwd, env: env4[vendor] });

			tzDirectus9[vendor] = [server1, server2, server3, server4];
			envs[vendor] = [env1, env2, env3, env4];

			promises.push(awaitDirectus9Connection(newServerPort1));
			promises.push(awaitDirectus9Connection(newServerPort2));
			promises.push(awaitDirectus9Connection(newServerPort3));
			promises.push(awaitDirectus9Connection(newServerPort4));
		}

		// Give the server some time to start
		await Promise.all(promises);
	}, 180000);

	afterAll(async () => {
		for (const [vendor, connection] of databases) {
			for (const instance of tzDirectus9[vendor]!) {
				instance.kill();
			}

			await connection.destroy();
		}
	});

	describe('GET /collections/:collection', () => {
		describe('schema change propagates across nodes using messenger', () => {
			it.each(vendors)('%s', async (vendor) => {
				// Setup
				const env1 = envs[vendor][0];
				const env2 = envs[vendor][1];

				await common.CreateCollection(vendor, { collection: newCollectionName, env: env1 });

				await request(getUrl(vendor, env1))
					.post(`/utils/cache/clear`)
					.set('Authorization', `Bearer ${common.USER.ADMIN.TOKEN}`);

				await request(getUrl(vendor, env1)).get(`/fields`).set('Authorization', `Bearer ${common.USER.ADMIN.TOKEN}`);

				await request(getUrl(vendor, env2))
					.post(`/utils/cache/clear`)
					.set('Authorization', `Bearer ${common.USER.ADMIN.TOKEN}`);

				await request(getUrl(vendor, env2)).get(`/fields`).set('Authorization', `Bearer ${common.USER.ADMIN.TOKEN}`);

				// Action
				const responseBefore = await request(getUrl(vendor, env1))
					.get(`/collections/${newCollectionName}`)
					.set('Authorization', `Bearer ${common.USER.ADMIN.TOKEN}`);

				const responseBefore2 = await request(getUrl(vendor, env2))
					.get(`/collections/${newCollectionName}`)
					.set('Authorization', `Bearer ${common.USER.ADMIN.TOKEN}`);

				await request(getUrl(vendor, env1))
					.delete(`/collections/${newCollectionName}`)
					.set('Authorization', `Bearer ${common.USER.ADMIN.TOKEN}`);

				const responseAfter = await request(getUrl(vendor, env1))
					.get(`/collections/${newCollectionName}`)
					.set('Authorization', `Bearer ${common.USER.ADMIN.TOKEN}`);

				const responseAfter2 = await request(getUrl(vendor, env2))
					.get(`/collections/${newCollectionName}`)
					.set('Authorization', `Bearer ${common.USER.ADMIN.TOKEN}`);

				// Assert
				expect(responseBefore.statusCode).toBe(200);
				expect(responseBefore2.statusCode).toBe(200);
				expect(responseAfter.statusCode).toBe(403);
				expect(responseAfter2.statusCode).toBe(403);
			});
		});

		describe('schema change does not propagate across nodes without messenger', () => {
			it.each(vendors)('%s', async (vendor) => {
				// Setup
				const env3 = envs[vendor][2];
				const env4 = envs[vendor][3];

				await common.CreateCollection(vendor, { collection: newCollectionName, env: env3 });

				await request(getUrl(vendor, env3))
					.post(`/utils/cache/clear`)
					.set('Authorization', `Bearer ${common.USER.ADMIN.TOKEN}`);

				await request(getUrl(vendor, env3)).get(`/fields`).set('Authorization', `Bearer ${common.USER.ADMIN.TOKEN}`);

				await request(getUrl(vendor, env4))
					.post(`/utils/cache/clear`)
					.set('Authorization', `Bearer ${common.USER.ADMIN.TOKEN}`);

				await request(getUrl(vendor, env4)).get(`/fields`).set('Authorization', `Bearer ${common.USER.ADMIN.TOKEN}`);

				// Action
				const responseBefore = await request(getUrl(vendor, env3))
					.get(`/collections/${newCollectionName}`)
					.set('Authorization', `Bearer ${common.USER.ADMIN.TOKEN}`);

				const responseBefore2 = await request(getUrl(vendor, env4))
					.get(`/collections/${newCollectionName}`)
					.set('Authorization', `Bearer ${common.USER.ADMIN.TOKEN}`);

				await request(getUrl(vendor, env3))
					.delete(`/collections/${newCollectionName}`)
					.set('Authorization', `Bearer ${common.USER.ADMIN.TOKEN}`);

				const responseAfter = await request(getUrl(vendor, env3))
					.get(`/collections/${newCollectionName}`)
					.set('Authorization', `Bearer ${common.USER.ADMIN.TOKEN}`);

				const responseAfter2 = await request(getUrl(vendor, env4))
					.get(`/collections/${newCollectionName}`)
					.set('Authorization', `Bearer ${common.USER.ADMIN.TOKEN}`);

				// Assert
				expect(responseBefore.statusCode).toBe(200);
				expect(responseBefore2.statusCode).toBe(200);
				expect(responseAfter.statusCode).toBe(403);
				expect(responseAfter2.statusCode).toBe(200);
			});
		});
	});
});
