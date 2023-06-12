import { defineEndpoint } from '@wbce-d9/extensions-sdk';

export default defineEndpoint((router) => {
	router.get('/', (_req, res) => res.send('Hello, World!'));
});
