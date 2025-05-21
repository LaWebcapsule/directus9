import os from 'node:os';
import { getEnv } from '../env.js';
import { parseCIDR } from '../utils/parse-cidr.js';

export const validateIP = async (ip: string, url: string) => {
	const env = getEnv();
	const ipDenyList = env['IMPORT_IP_DENY_LIST'] || [];

	// Check if IP matches any CIDR in the deny list
	for (const deniedRange of ipDenyList) {
		// Check for CIDR
		if (deniedRange.includes('/')) {
			if (parseCIDR(deniedRange)) {
				throw new Error(`Requested URL "${url}" resolves to a denied IP address`);
			}
		} else if (deniedRange === ip) {
			throw new Error(`Requested URL "${url}" resolves to a denied IP address`);
		}
	}

	// Special case: "0.0.0.0" blocks all local interfaces
	if (ipDenyList.includes('0.0.0.0')) {
		const networkInterfaces = os.networkInterfaces();

		for (const networkInfo of Object.values(networkInterfaces)) {
			if (!networkInfo) continue;

			for (const info of networkInfo) {
				// Check if IP belongs to local subnet
				if (info.internal && info.cidr) {
					if (parseCIDR(info.cidr)) {
						throw new Error(`Requested URL "${url}" resolves to a denied IP address`);
					}
				} else if (info.address === ip) {
					throw new Error(`Requested URL "${url}" resolves to a denied IP address`);
				}
			}
		}
	}
};
