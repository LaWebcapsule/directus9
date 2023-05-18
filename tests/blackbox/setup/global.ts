import { ChildProcess } from 'child_process';

const global = {
	directus9: {} as { [vendor: string]: ChildProcess },
	directus9NoCache: {} as { [vendor: string]: ChildProcess },
};

export default global;
