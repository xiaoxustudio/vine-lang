import path from "node:path";
import { Export, ModuleTag } from "../package";
import Environment from "@/environment";
import { Token } from "@/keywords";
import LiteralFn from "@/utils/LiteralFn";

export interface VinePathModule {
	/**
	 * @description: 获取当前环境文件路径
	 * @return {*}
	 */
	file: (this: Environment) => void;
	/**
	 * @description: 获取当前环境文件目录
	 * @return {*}
	 */
	dir: (this: Environment) => void;
	/**
	 * @description: 获取当前环境文件扩展名
	 * @return {*}
	 */
	extname: (this: Environment, ...args: Token[]) => void;
	/**
	 * @description: 解析路径
	 * @return {*}
	 */
	resolve: (this: Environment, ...args: Token[]) => void;
	/**
	 * @description: 拼接路径
	 * @return {*}
	 */
	join: (this: Environment, ...args: Token[]) => void;
	/**
	 * @description: 判断路径是否为绝对路径
	 * @return {*}
	 */
	isAbsolute: (this: Environment, ...args: Token[]) => void;
}

export default {
	__module__: ModuleTag,
	file: function (this: Environment) {
		return LiteralFn(path.basename(this.filePath));
	},
	dir: function (this: Environment) {
		return LiteralFn(path.dirname(this.filePath));
	},
	extname: function (this: Environment) {
		return LiteralFn(path.extname(this.filePath));
	},
	resolve: function (this: Environment, ...args: Token[]) {
		return LiteralFn(path.resolve(...args.map(arg => Export(arg))));
	},
	join: function (this: Environment, ...args: Token[]) {
		return LiteralFn(path.join(...args.map(arg => Export(arg))));
	},
	isAbsolute: function (this: Environment, pathName: Token) {
		return LiteralFn(path.isAbsolute(Export(pathName)));
	},
} as VinePathModule;
