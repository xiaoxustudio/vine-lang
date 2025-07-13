import path from "node:path";
import { Export, ModuleTag } from "../package";
import Environment from "@/environment";
import { Token } from "@/keywords";
import LiteralFn from "@/utils/LiteralFn";

export interface VinePathModule {
	file: (this: Environment) => void;
	dir: (this: Environment) => void;
	extname: (this: Environment, ...args: Token[]) => void;
	resolve: (this: Environment, ...args: Token[]) => void;
	join: (this: Environment, ...args: Token[]) => void;
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
