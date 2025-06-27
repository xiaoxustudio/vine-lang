import { Expr, Literal } from "@/node";
import { Token, TokenType } from "@/keywords";
import { Environment } from "@/environment";

export interface TokenExEnvironment extends Omit<Token, "value"> {
	value: Environment;
}

export function UseEnvFn(env: Environment) {
	return {
		type: TokenType.env,
		value: env,
		line: 0,
		column: 0,
	} as TokenExEnvironment;
}

export function LiteralFn(s: string | number | boolean | null | Literal) {
	if (s && (s as any)?.type === "Literal") {
		return s as Literal;
	}
	const type = (() => {
		switch (typeof s) {
			case "number":
				return TokenType.number;
			case "string":
				return TokenType.string;
			case "boolean":
				return TokenType.boolean;
			case "object":
				// object 则必定是 nil
				return TokenType.nil;
			default:
				return TokenType.nil;
		}
	})();
	return {
		type: "Literal",
		value: { column: 0, line: 0, value: s, type },
	} as Literal;
}

export function toRealValue(expr: Literal | Token) {
	const token = expr?.type === "Literal" ? expr.value : expr;
	switch (token?.type) {
		case TokenType.index:
		case TokenType.number:
			return Number(token.value);
		case TokenType.string:
		case TokenType.identifier:
			return `${token.value}`;
		case TokenType.boolean:
			return !!token.value;
		case TokenType.nan:
			return Number.NaN;
		case TokenType.nil:
			return null;
		default:
			console.log(expr);
			return expr?.value
				? token
				: Array.isArray(expr)
				? expr.map(v => toRealValue(v))
				: typeof expr === "object"
				? mapToObject(expr as any, toRealValue)
				: expr;
	}
}

export function mapToObject(obj: Map<Literal, Expr>, fn: (v: any) => any) {
	if (!(obj instanceof Map)) throw new Error("obj is not Map");
	const isArray =
		obj.entries().next().value[0]?.value?.type === TokenType.index;
	const result = isArray ? [] : {};
	for (const [key, value] of obj) {
		const rKey = toRealValue(key);
		if (value instanceof Map) {
			if (Array.isArray(result)) {
				result.push(mapToObject(value, fn));
			} else {
				result[rKey.value ?? rKey] = mapToObject(value, fn);
			}
		} else {
			if (Array.isArray(result)) {
				result.push(fn(value));
			} else {
				result[rKey.value ?? rKey] = fn(value);
			}
		}
	}
	return result;
}

export function isToken(expr: Expr) {
	return Object.keys(TokenType).includes(expr?.type);
}

export function isNilLiteral(expr: Literal) {
	const token = expr?.type === "Literal" ? expr.value : expr;
	return token?.type === TokenType.nil;
}

export function isNil(input: any) {
	return input === null || typeof input === "undefined" || input === "nil";
}

export function isBuilInObject(expr: Token | Expr) {
	return expr instanceof Environment || expr.type === TokenType.env;
}

export function builInObjectToString(expr: Token | Expr) {
	const str = (s: string, code = 90) => `\x1b[${code}m${s}\x1b[0m`;
	if (expr instanceof Environment || expr?.type === TokenType.env) {
		return str("[[Environment]]", 94);
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
