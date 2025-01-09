export function parseCIDR (cidr: string): boolean {
	const [ip, subnet] = cidr.split('/');
	if (!ip || !subnet) {
		console.warn(`Invalid CIDR format: ${cidr}`);
		return false;
	}

	const subnetMask = parseInt(subnet, 10);
	if (isNaN(subnetMask) || subnetMask < 0 || subnetMask > 32) {
		console.warn(`Invalid subnet mask in CIDR: ${cidr}`);
		return false;
	}

	const ipSegments = ip.split('.').map(Number);
	if (ipSegments.length !== 4) {
		console.warn(`Invalid IP format: ${ip}`);
		return false;
	}

	// Compute netmask from subnetMask
	let netmask = 0xFFFFFFFF << (32 - subnetMask) >>> 0;

	const ipInt = ipSegments.reduce((acc, segment, i) => acc + (segment << ((3 - i) * 8)), 0) >>> 0;

	// Check if ip belongs to subnet
	return (ipInt & netmask) === (ipInt & netmask);
};
