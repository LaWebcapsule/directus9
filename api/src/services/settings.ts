import type { AbstractServiceOptions } from '../types/index.js';
import { ItemsService } from './items.js';

export class SettingsService extends ItemsService {
	constructor(options: AbstractServiceOptions) {
		super('directus9_settings', options);
	}
}
