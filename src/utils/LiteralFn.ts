import { TokenType } from "@/keywords";
import { Literal } from "@/node";

export default function LiteralFn(
	s: string | number | boolean | null | Literal
) {
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
