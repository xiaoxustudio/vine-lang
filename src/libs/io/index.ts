import fs from "node:fs";
import { Export, ModuleTag } from "../package";
import path from "node:path";
import Environment from "@/environment";
import { Token } from "@/keywords";
import LiteralFn from "@/utils/LiteralFn";
import { Literal } from "@/node";
import { LikeModule } from "../types";

export interface VineIOModule extends LikeModule {
	/**
	 * @description: 判断文件是否存在
	 */
	exists: (this: Environment, pathName: Token) => Literal;
	/**
	 * @description: 读取文件内容
	 */
	read: (this: Environment, pathName: Token) => Literal;
	/**
	 * @description: 写入文件内容
	 */
	write: (this: Environment, pathName: Token, content: Token) => void;
	/**
	 * @description: 删除文件
	 */
	delete: (this: Environment, pathName: Token) => void;
	/**
	 * @description: 创建文件夹
	 */
	mkdir: (this: Environment, pathName: Token) => void;
	/**
	 * @description: 删除文件夹
	 */
	deleteDir: (this: Environment, pathName: Token) => void;
	/**
	 * @description: 获取文件信息
	 */
	info: (this: Environment, pathName: Token) => void;
}

export default {
	__module__: ModuleTag,
	read(pathName) {
		return LiteralFn(
			fs
				.readFileSync(
					path.join(
						path.dirname(this.filePath),
						Export(pathName) as string
					),
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
	}
} as VineIOModule;
