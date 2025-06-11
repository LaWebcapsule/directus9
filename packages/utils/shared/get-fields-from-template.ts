export function getFieldsFromTemplate(template: string | null): string[] {
	if (template === null) return [];

	const fields: string[] = [];
	let i = 0;

	while (i < template.length) {
		// Find the start of a template {{
		const startIndex = template.indexOf('{{', i);
		if (startIndex === -1) break;

		// Find the end of a template }}
		const endIndex = template.indexOf('}}', startIndex + 2);
		if (endIndex === -1) break;

		// Extract content between {{ and }}
		const content = template.substring(startIndex + 2, endIndex).trim();

		if (content) {
			fields.push(content);
		}

		// Continue after the end of this template
		i = endIndex + 2;
	}

	return fields;
}
