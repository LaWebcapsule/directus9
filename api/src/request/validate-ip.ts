import { BlockList } from 'net';
import os from 'node:os';
import { getEnv } from '../env.js';
import logger from '../logger.js';

export const validateIP = async (ip: string, url: string) => {
	const env = getEnv();
	const ipDenyList = env['IMPORT_IP_DENY_LIST'] || [];

	// Create a BlockList for efficient IP range checking
	const blockList = new BlockList();

	// Add all denied ranges to the block list
	for (const deniedRange of ipDenyList) {
		try {
			if (deniedRange.includes('/')) {
				// CIDR notation
				const parts = deniedRange.split('/');
				const network = parts[0];
				const prefixLengthStr = parts[1];

				if (!network || !prefixLengthStr) {
					throw new Error('Invalid CIDR format: missing network or prefix');
				}

				const prefixLength = parseInt(prefixLengthStr, 10);

				if (isNaN(prefixLength)) {
					throw new Error('Invalid CIDR format: prefix length must be a number');
				}

				blockList.addSubnet(network, prefixLength);
			} else {
				// Single IP address
				blockList.addAddress(deniedRange);
			}
		} catch (error) {
			// If there's an error in the deny list configuration, throw immediately
			// This ensures typos like "192.0.0.36/33" are caught
			throw new Error(
				`Invalid IP deny list entry "${deniedRange}": ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}

	// Special case: "0.0.0.0" blocks all local interfaces AND loopback addresses
	if (ipDenyList.includes('0.0.0.0')) {
		try {
			// Add the entire loopback range (127.0.0.0/8) to fix the vulnerability
			// This blocks all 127.x.x.x addresses, not just 127.0.0.1
			blockList.addSubnet('127.0.0.0', 8);

			// Add local network interfaces
			const networkInterfaces = os.networkInterfaces();

			for (const networkInfo of Object.values(networkInterfaces)) {
				if (!networkInfo) continue;

				for (const info of networkInfo) {
					if (info.internal && info.cidr) {
						try {
							const parts = info.cidr.split('/');
							const network = parts[0];
							const prefixLengthStr = parts[1];

							if (!network || !prefixLengthStr) {
								logger.warn(`Warning: Invalid local interface CIDR format "${info.cidr}": missing network or prefix`);
								continue;
							}

							const prefixLength = parseInt(prefixLengthStr, 10);

							if (isNaN(prefixLength)) {
								logger.warn(`Warning: Invalid prefix length in CIDR "${info.cidr}"`);
								continue;
							}

							blockList.addSubnet(network, prefixLength);
						} catch (error) {
							// Log but don't fail for invalid local interface CIDR
							logger.warn(
								`Warning: Invalid local interface CIDR "${info.cidr}": ${
									error instanceof Error ? error.message : 'Unknown error'
								}`
							);
						}
					}
				}
			}
		} catch (error) {
			throw new Error(
				`Error setting up loopback protection: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}

	// Check if the IP is blocked
	if (blockList.check(ip)) {
		throw new Error(`Requested URL "${url}" resolves to a denied IP address`);
	}
};
