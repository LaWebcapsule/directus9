import os from 'node:os';
import { getEnv } from '../env.js';
import { parseCIDR, isLoopbackIP } from '../utils/parse-cidr.js';

export const validateIP = async (ip: string, url: string) => {
	const env = getEnv();
	const ipDenyList = env['IMPORT_IP_DENY_LIST'] || [];

	// Check if IP matches any CIDR in the deny list
	for (const deniedRange of ipDenyList) {
		// Check for CIDR notation
		if (deniedRange.includes('/')) {
			if (parseCIDR(ip, deniedRange)) {
				throw new Error(`Requested URL "${url}" resolves to a denied IP address`);
			}
		} else if (deniedRange === ip) {
			throw new Error(`Requested URL "${url}" resolves to a denied IP address`);
		}
	}

	// Special case: "0.0.0.0" blocks all local interfaces AND loopback addresses
	if (ipDenyList.includes('0.0.0.0')) {
		// First, check if the IP is in the loopback range (127.0.0.0/8)
		// This fixes the vulnerability by blocking all 127.x.x.x addresses
		if (isLoopbackIP(ip)) {
			throw new Error(`Requested URL "${url}" resolves to a denied IP address`);
		}

		// Then check local network interfaces
		const networkInterfaces = os.networkInterfaces();

		for (const networkInfo of Object.values(networkInterfaces)) {
			if (!networkInfo) continue;

			for (const info of networkInfo) {
				// Check if IP belongs to local subnet using CIDR
				if (info.internal && info.cidr) {
					if (parseCIDR(ip, info.cidr)) {
						throw new Error(`Requested URL "${url}" resolves to a denied IP address`);
					}
				}
				// Also check direct address match

				if (info.address === ip) {
					throw new Error(`Requested URL "${url}" resolves to a denied IP address`);
				}
			}
		}
	}
};
