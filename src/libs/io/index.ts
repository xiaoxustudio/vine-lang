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
	delete: (this: Environment, pathName: Token) => void;
	mkdir: (this: Environment, pathName: Token) => void;
	deleteDir: (this: Environment, pathName: Token) => void;
	info: (this: Environment, pathName: Token) => void;
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
	delete(pathName) {
		fs.unlinkSync(path.join(path.dirname(this.filePath), Export(pathName)));
		return LiteralFn(null);
	},
	mkdir(pathName) {
		fs.mkdirSync(path.join(path.dirname(this.filePath), Export(pathName)));
		return LiteralFn(null);
	},
	deleteDir(pathName) {
		fs.rmdirSync(path.join(path.dirname(this.filePath), Export(pathName)));
		return LiteralFn(null);
	},
	info(pathName) {
		const info = fs.statSync(
			path.join(path.dirname(this.filePath), Export(pathName))
		);
		const infoMap = new Map();
		for (const key in info) {
			if (typeof info[key] === "function") continue; // 剔除方法，后续自行封装进去
			infoMap.set(key, info[key]);
		}
		infoMap.set("isFile", info.isFile());
		infoMap.set("isDirectory", info.isDirectory());
		infoMap.set("isBlockDevice", info.isBlockDevice());
		infoMap.set("isCharacterDevice", info.isCharacterDevice());
		infoMap.set("isSymbolicLink", info.isSymbolicLink());
		infoMap.set("isFIFO", info.isFIFO());
		infoMap.set("isSocket", info.isSocket());
		return infoMap;
	},
} as VineIOModule;
