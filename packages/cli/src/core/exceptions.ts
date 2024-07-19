import redent from 'redent';

export type CLIError = Error & {
	isAxiosError?: true;
	request?: any;
	response?: any;
	parent?: CLIError;
	code?: string | undefined;
	stack?: string | undefined;
};

export class CLIRuntimeError extends Error {
	public readonly code?: string | undefined;
	constructor(message: string, code?: string) {
		super(redent(message).trim());
		this.code = code;
	}
}
