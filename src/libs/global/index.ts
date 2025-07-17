import { Token } from "@/keywords";
import { Literal } from "@/node";
import {
	isNilLiteral,
	isNil,
	isBuilInObject,
	isFunction,
	BaseDataTag,
} from "@/utils";
import builInObjectToString from "@/utils/builInObjectToString";
import toRealValue from "@/utils/toRealValue";

/**
 * @description: print log
 * @param {Token} args
 * @return {*}
 */
const print = (args: Token[]) => {
	const isArray = Array.isArray(args);
	const toLocalRealvalue = (e: Token, toRaal = true) => {
		const output = toRaal ? toRealValue(e as unknown as Literal) : e;
		return (isNilLiteral(e as unknown as Literal) && isNil(output)) ||
			isBuilInObject(output) ||
			isFunction(output)
			? builInObjectToString(output)
			: output;
	};
	// 原生js数据类型
	if (args instanceof Map && (args as any)?.type !== BaseDataTag.ARRAY) {
		const entries = Object.fromEntries(args);
		console.log(entries);
		return;
	}
	// Vine基础数据类型
	const results = isArray
		? args.map(e => toLocalRealvalue(e))
		: toLocalRealvalue(args);

	console.log(...(isArray ? results : [results]));
};

export { print };
