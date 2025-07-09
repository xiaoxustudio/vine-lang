import { Token } from "@/keywords";
import { Literal } from "@/node";
import { isNilLiteral, isNil, isBuilInObject } from "@/utils";
import builInObjectToString from "@/utils/builInObjectToString";
import toRealValue from "@/utils/toRealValue";

const print = (args: Token[]) => {
	const isArray = Array.isArray(args);
	const toLocalRealvalue = (e: Token) => {
		const output = toRealValue(e as unknown as Literal);
		return isNilLiteral(e as unknown as Literal) && isNil(output)
			? "\x1b[36mnil\x1b[0m"
			: isBuilInObject(output)
			? builInObjectToString(output)
			: output;
	};
	const results =
		typeof args === "object"
			? isArray
				? args.map(e => toLocalRealvalue(e))
				: toRealValue(args)
			: args;
	console.log(...(isArray ? results : [results]));
};

export { print };
