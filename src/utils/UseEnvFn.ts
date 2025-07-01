import Environment from "@/environment";
import { Token, TokenType } from "@/keywords";

export interface TokenExEnvironment extends Omit<Token, "value"> {
	value: Environment;
}

export default function UseEnvFn(env: Environment) {
	return {
		type: TokenType.env,
		value: env,
		line: 0,
		column: 0,
	} as TokenExEnvironment;
}
