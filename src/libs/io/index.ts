import fs from "node:fs";
import { Export, ModuleTag } from "../package";
import path from "node:path";
import Environment from "@/environment";
import { Token } from "@/keywords";
import LiteralFn from "@/utils/LiteralFn";
import { Literal } from "@/node";

export interface VineIOModule {
	exists: (this: Environment, pathName: Token) => void;
	read: (this: Environment, pathName: Token) => Literal;
	write: (this: Environment, pathName: Token, content: Token) => void;
}

export default {
	__module__: ModuleTag,
	read(pathName) {
		return LiteralFn(
			fs
				.readFileSync(
					path.join(path.dirname(this.filePath), Export(pathName) as string),
					"utf8"
				)
				.toString()
		);
	},
	write(pathName, content) {
		fs.writeFileSync(
			path.join(path.dirname(this.filePath), Export(pathName)),
			Export(content)
		);
		return LiteralFn(null);
	},
	exists(pathName) {
		return fs.existsSync(
			path.join(path.dirname(this.filePath), Export(pathName))
		)
			? LiteralFn(true)
			: LiteralFn(false);
	},
} as VineIOModule;
