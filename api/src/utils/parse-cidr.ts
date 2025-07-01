export function parseCIDR(ip: string, cidr: string): boolean {
	const [networkIP, subnet] = cidr.split('/');

	if (!networkIP || !subnet) {
		// Remove logger dependency to fix test issues
		return false;
	}

	const subnetMask = parseInt(subnet, 10);

	if (isNaN(subnetMask) || subnetMask < 0 || subnetMask > 32) {
		return false;
	}

	// Validate IP format for both the target IP and network IP
	const targetIPSegments = ip.split('.').map(Number);
	const networkIPSegments = networkIP.split('.').map(Number);

	if (targetIPSegments.length !== 4 || networkIPSegments.length !== 4) {
		return false;
	}

	// Check if any segment is invalid (not 0-255)
	for (const segment of [...targetIPSegments, ...networkIPSegments]) {
		if (isNaN(segment) || segment < 0 || segment > 255) {
			return false;
		}
	}

	// Compute netmask from subnetMask
	const netmask = (0xffffffff << (32 - subnetMask)) >>> 0;

	// Convert IPs to 32-bit integers
	const targetIPInt = targetIPSegments.reduce((acc, segment, i) => acc + (segment << ((3 - i) * 8)), 0) >>> 0;
	const networkIPInt = networkIPSegments.reduce((acc, segment, i) => acc + (segment << ((3 - i) * 8)), 0) >>> 0;

	// Check if target IP belongs to the CIDR subnet
	return (targetIPInt & netmask) === (networkIPInt & netmask);
}

// Helper function to check if an IP is in the loopback range (127.0.0.0/8)
export function isLoopbackIP(ip: string): boolean {
	return parseCIDR(ip, '127.0.0.0/8');
}
