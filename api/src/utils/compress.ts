import { compress as compressSnappy, uncompress as uncompressSnappy } from 'snappy';

export async function compress(raw: Record<string, any> | Record<string, any>[]): Promise<Buffer> {
	if (!raw) return raw;
	return await compressSnappy(JSON.stringify(raw));
}

export async function decompress(compressed: Buffer): Promise<any> {
	if (!compressed) return compressed;
	return JSON.parse((await uncompressSnappy(compressed, { asBuffer: false })) as string);
}
