import { TokenType } from "@/keywords";
import { Literal, Expr } from "@/node";
import toRealValue from "./toRealValue";

export default function mapToObject(
	obj: Map<Literal, Expr>,
	fn: (v: any) => any
) {
	if (!(obj instanceof Map))
		throw new Error("obj is not Map , current type is : " + typeof obj);
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
