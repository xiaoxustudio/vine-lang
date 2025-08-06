import { Token } from "@/keywords";
import toRealValue from "@/utils/toRealValue";

export function Export(args: Token | Token[]) {
	if (!Array.isArray(args)) return toRealValue(args);
	return args.map((v) => toRealValue(v));
}

export const ModuleTag = Symbol("ModuleTag"); // 模块标识
