import Environment from "@/environment";
import { Token, TokenType } from "@/keywords";
import { Expr } from "@/node";
import { isPromise } from ".";

export default function builInObjectToString(expr: Token | Expr) {
	const str = (s: string, code = 90) => `\x1b[${code}m${s}\x1b[0m`;
	if (expr instanceof Environment || expr?.type === TokenType.env) {
		return str("[[Environment]]", 94);
	}
	if (isPromise(expr)) {
		return str("[[Task]]", 94);
	}
	switch (typeof expr) {
		case "number":
			return str(expr as unknown as string, 34);
		case "string":
			return str(expr as unknown as string, 33);
		case "boolean":
			return str(expr as unknown as string, 36);
		default:
			if (expr === null) {
				return str("nil" as unknown as string, 96);
			}
			if (Number.isNaN(expr)) {
				return str("NaN" as unknown as string, 94);
			}
			return str(expr as unknown as string);
	}
}
