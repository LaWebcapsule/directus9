import type { Driver, Range } from '@wbce-d9/storage';
import { normalizePath } from '@wbce-d9/utils';
import { Blob, Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import { extname, join, parse } from 'node:path';
import { Readable } from 'node:stream';
import PQueue from 'p-queue';
import type { RequestInit } from 'undici';
import { fetch, FormData } from 'undici';
import { IMAGE_EXTENSIONS, VIDEO_EXTENSIONS } from './constants.js';

export type DriverCloudinaryConfig = {
	root?: string;
	cloudName: string;
	apiKey: string;
	apiSecret: string;
	accessMode: 'public' | 'authenticated';
};

export class DriverCloudinary implements Driver {
	private root: string;
	private apiKey: string;
	private apiSecret: string;
	private cloudName: string;
	private accessMode: 'public' | 'authenticated';

	constructor(config: DriverCloudinaryConfig) {
		this.root = config.root ? normalizePath(config.root, { removeLeading: true }) : '';
		this.apiKey = config.apiKey;
		this.apiSecret = config.apiSecret;
		this.cloudName = config.cloudName;
		this.accessMode = config.accessMode;
	}

	private fullPath(filepath: string) {
		return normalizePath(join(this.root, filepath), { removeLeading: true });
	}

	private toFormUrlEncoded(obj: Record<string, string>, options?: { sort: boolean }) {
		let entries = Object.entries(obj);

		if (options?.sort) {
			entries = entries.sort(([keyA], [keyB]) => keyA.localeCompare(keyB));
		}

		return new URLSearchParams(entries).toString();
	}

	/**
	 * Generate the Cloudinary sha256 signature for the given payload
	 * @see https://cloudinary.com/documentation/signatures
	 */
	private getFullSignature(payload: Record<string, string>) {
		const denylist = ['file', 'cloud_name', 'resource_type', 'api_key'];

		const signaturePayload = Object.fromEntries(
			Object.entries(payload).filter(([key]) => denylist.includes(key) === false)
		);

		const signaturePayloadString = this.toFormUrlEncoded(signaturePayload, { sort: true });

		return createHash('sha256')
			.update(signaturePayloadString + this.apiSecret)
			.digest('hex');
	}

	/**
	 * Creates inline URL signature for use with the image reading API
	 * @see https://cloudinary.com/documentation/advanced_url_delivery_options#generating_delivery_url_signatures
	 */
	private getParameterSignature(filepath: string) {
		return `s--${createHash('sha256')
			.update(filepath + this.apiSecret)
			.digest('base64url')
			.substring(0, 8)}--`;
	}

	private getTimestamp() {
		return String(new Date().getTime());
	}

	/**
	 * Used to guess what resource type is appropriate for a given filepath
	 * @see https://cloudinary.com/documentation/image_transformations#image_upload_note
	 */
	private getResourceType(filepath: string) {
		const fileExtension = extname(filepath);
		if (IMAGE_EXTENSIONS.includes(fileExtension)) return 'image';
		if (VIDEO_EXTENSIONS.includes(fileExtension)) return 'video';
		return 'raw';
	}

	/**
	 * For Cloudinary Admin APIs, the file extension needs to be omitted for images and videos. Raw
	 * on the other hand requires the extension to be present.
	 */
	private getPublicId(filepath: string) {
		const resourceType = this.getResourceType(filepath);
		if (resourceType === 'raw') return filepath;
		return parse(filepath).name;
	}

	/**
	 * Generates the Authorization header value for Cloudinary's basic auth endpoints
	 */
	private getBasicAuth() {
		const creds = `${this.apiKey}:${this.apiSecret}`;
		const base64 = Buffer.from(creds).toString('base64');
		return `Basic ${base64}`;
	}

	async read(filepath: string, range?: Range) {
		const resourceType = this.getResourceType(filepath);
		const fullPath = this.fullPath(filepath);
		const signature = this.getParameterSignature(fullPath);
		const url = `https://res.cloudinary.com/${this.cloudName}/${resourceType}/upload/${signature}/${fullPath}`;

		const requestInit: RequestInit = { method: 'GET' };

		if (range) {
			requestInit.headers = {
				Range: `bytes=${range.start ?? ''}-${range.end ?? ''}`,
			};
		}

		const response = await fetch(url, requestInit);

		if (response.status >= 400 || !response.body) {
			throw new Error(`No stream returned for file "${filepath}"`);
		}

		return Readable.fromWeb(response.body);
	}

	async stat(filepath: string) {
		const fullPath = this.fullPath(filepath);
		const resourceType = this.getResourceType(fullPath);
		const publicId = this.getPublicId(fullPath);

		const parameters = {
			public_id: publicId,
			type: 'upload',
			api_key: this.apiKey,
			timestamp: this.getTimestamp(),
		};

		const signature = this.getFullSignature(parameters);

		const body = this.toFormUrlEncoded({
			...parameters,
			signature,
		});

		const url = `https://api.cloudinary.com/v1_1/${this.cloudName}/${resourceType}/explicit`;

		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
			},
			body,
		});

		if (response.status >= 400) {
			throw new Error(`No stat returned for file "${filepath}"`);
		}

		const { bytes, created_at } = (await response.json()) as { bytes: number; created_at: string };
		return { size: bytes, modified: new Date(created_at) };
	}

	async exists(filepath: string) {
		try {
			await this.stat(filepath);
			return true;
		} catch {
			return false;
		}
	}

	async move(src: string, dest: string) {
		const fullSrc = this.fullPath(src);
		const fullDest = this.fullPath(dest);
		const resourceType = this.getResourceType(fullSrc);

		const url = `https://api.cloudinary.com/v1_1/${this.cloudName}/${resourceType}/rename`;

		const parameters = {
			from_public_id: this.getPublicId(fullSrc),
			to_public_id: this.getPublicId(fullDest),
			api_key: this.apiKey,
			timestamp: this.getTimestamp(),
		};

		const signature = this.getFullSignature(parameters);

		const body = this.toFormUrlEncoded({
			...parameters,
			signature,
		});

		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
			},
			body,
		});

		if (response.status >= 400) {
			const responseData = (await response.json()) as { error?: { message?: string } };
			throw new Error(`Can't move file "${src}": ${responseData?.error?.message ?? 'Unknown'}`);
		}
	}

	async copy(src: string, dest: string) {
		const stream = await this.read(src);
		await this.write(dest, stream);
	}

	async write(filepath: string, content: Readable) {
		const fullPath = this.fullPath(filepath);
		const resourceType = this.getResourceType(fullPath);

		const uploadParameters = {
			timestamp: this.getTimestamp(),
			api_key: this.apiKey,
			type: 'upload',
			access_mode: this.accessMode,
			public_id: this.getPublicId(fullPath),
		};

		const signature = this.getFullSignature(uploadParameters);

		let currentChunkSize = 0;
		let totalSize = 0;
		let uploaded = 0;
		let error: Error | null = null;

		const queue = new PQueue({ concurrency: 10 });

		const chunks: Buffer[] = [];

		for await (const chunk of content) {
			chunks.push(chunk);
			currentChunkSize += chunk.length;

			// Cloudinary requires each chunk to be at least 5MB. We'll submit the chunk as soon as we
			// reach 5.5MB to be safe
			if (currentChunkSize >= 5.5e6) {
				const uploadChunkParams: Parameters<typeof this.uploadChunk>[0] = {
					resourceType,
					blob: new Blob(chunks),
					bytesOffset: uploaded,
					bytesTotal: -1,
					parameters: {
						signature,
						...uploadParameters,
					},
				};

				queue
					.add(() => this.uploadChunk(uploadChunkParams))
					.catch((err) => {
						error = err;
					});

				uploaded += currentChunkSize;
				currentChunkSize = 0;
				chunks.length = 0; // empty the array of chunks
			}

			totalSize += chunk.length;
		}

		queue
			.add(() =>
				this.uploadChunk({
					resourceType,
					blob: new Blob(chunks),
					bytesOffset: uploaded,
					bytesTotal: totalSize,
					parameters: {
						signature,
						...uploadParameters,
					},
				})
			)
			.catch((err) => {
				error = err;
			});

		await queue.onIdle();

		if (error) {
			throw new Error(`Can't upload file "${filepath}": ${(error as Error).message}`, { cause: error });
		}
	}

	private async uploadChunk({
		resourceType,
		blob,
		bytesOffset,
		bytesTotal,
		parameters,
	}: {
		resourceType: string;
		blob: Blob;
		bytesOffset: number;
		bytesTotal: number;
		parameters: {
			timestamp: string;
			[key: string]: string;
		};
	}) {
		const formData = new FormData();

		formData.set('file', blob);

		for (const [key, value] of Object.entries(parameters)) {
			formData.set(key, value);
		}

		const response = await fetch(`https://api.cloudinary.com/v1_1/${this.cloudName}/${resourceType}/upload`, {
			method: 'POST',
			body: formData,
			headers: {
				/** @see https://support.cloudinary.com/hc/en-us/articles/208263735-Guidelines-for-self-implementing-chunked-upload-to-Cloudinary */
				'X-Unique-Upload-Id': parameters.timestamp,
				'Content-Range': `bytes ${bytesOffset}-${bytesOffset + blob.size - 1}/${bytesTotal}`,
			},
		});

		if (response.status >= 400) {
			const responseData = (await response.json()) as { error?: { message?: string } };
			throw new Error(responseData?.error?.message ?? 'Unknown');
		}
	}

	async delete(filepath: string) {
		const fullPath = this.fullPath(filepath);
		const resourceType = this.getResourceType(fullPath);
		const publicId = this.getPublicId(fullPath);
		const url = `https://api.cloudinary.com/v1_1/${this.cloudName}/${resourceType}/destroy`;

		const parameters = {
			timestamp: this.getTimestamp(),
			api_key: this.apiKey,
			resource_type: resourceType,
			public_id: publicId,
		};

		const signature = this.getFullSignature(parameters);

		await fetch(url, {
			method: 'POST',
			body: this.toFormUrlEncoded({
				...parameters,
				signature,
			}),
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
			},
		});
	}

	async *list(prefix = '') {
		const fullPath = this.fullPath(prefix);
		const publicId = this.getPublicId(fullPath);

		let nextCursor = '';

		do {
			const response = await fetch(
				`https://api.cloudinary.com/v1_1/${this.cloudName}/resources/search?expression=${publicId}*&next_cursor=${nextCursor}`,
				{
					method: 'GET',
					headers: {
						Authorization: this.getBasicAuth(),
					},
				}
			);

			const json = (await response.json()) as {
				next_cursor: string;
				resources: {
					public_id: string;
				}[];
			};

			if (response.status >= 400) {
				const responseData = (await response.json()) as { error?: { message?: string } };
				throw new Error(`Can't list for prefix "${prefix}": ${responseData?.error?.message ?? 'Unknown'}`);
			}

			nextCursor = json.next_cursor;

			for (const file of json.resources) {
				yield file.public_id;
			}
		} while (nextCursor);
	}
}

export default DriverCloudinary;
