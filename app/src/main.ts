/* eslint-disable no-console */

import { getVueComponentName } from '@/utils/get-vue-component-name';
import { createPinia } from 'pinia';
import { createApp } from 'vue';
import App from './app.vue';
import { registerComponents } from './components/register';
import { DIRECTUS_LOGO } from './constants';
import { registerDirectives } from './directives/register';
import { i18n } from './lang/';
import { router } from './router';
import './styles/main.scss';
import { registerViews } from './views/register';
import { loadExtensions, registerExtensions } from './extensions';

init();

async function init() {
	console.log(DIRECTUS_LOGO);

	console.info(
		`Hey! Interested in helping build this open-source data management platform?\nIf so, join our growing team of contributors at: https://directus.chat`
	);

	console.info(`%c🐰 Starting Directus...`, 'color:Green');

	console.time('🕓 Application Loaded');

	const app = createApp(App);

	app.use(router);
	app.use(i18n);
	app.use(createPinia());

	app.config.errorHandler = (err, vm, info) => {
		const source = getVueComponentName(vm);
		console.warn(`[app-${source}-error] ${info}`);
		console.warn(err);
		return false;
	};

	registerDirectives(app);
	registerComponents(app);
	registerViews(app);

	await loadExtensions();

	registerExtensions(app);

	app.mount('#app');

	console.timeEnd('🕓 Application Loaded');

	console.group(`%c✨ Project Information`, 'color:DodgerBlue'); // groupCollapsed

	console.info(`%cEnvironment: ${import.meta.env.MODE}`, 'color:DodgerBlue');
	console.groupEnd();

	// Prevent the browser from opening files that are dragged on the window
	window.addEventListener('dragover', (e) => e.preventDefault(), false);
	window.addEventListener('drop', (e) => e.preventDefault(), false);
}
