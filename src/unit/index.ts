/* 操作单元（操作Node） */

import { BlockStmt, UnitNodeInstance } from "@/node";

class UnitNode<T> {
	readonly __origin: T;

	get parent() {
		return null;
	}

	constructor(obj: T) {
		Object.assign(this, obj);

		const blockDefineFn = (blockStmt: BlockStmt) => {
			const body = Array.isArray(blockStmt)
				? blockStmt
				: (blockStmt as unknown as UnitNodeInstance<BlockStmt>).body;
			for (const stmt of body) {
				delete stmt.parent;
				Object.defineProperty(stmt, "parent", {
					get: () => {
						return this as unknown as UnitNodeInstance<BlockStmt>;
					},
					enumerable: true,
					configurable: true
				});
			}
		};

		// @ts-ignore
		if (obj?.body) {
			// @ts-ignore
			blockDefineFn(obj.body as unknown as BlockStmt);
		}

		this.__origin = obj;
	}

	/**
	 * @description: 查找上级作用域中的块
	 * @return {*}
	 */
	findBlock(): UnitNodeInstance<BlockStmt> | null {
		let parent = this.parent;
		for (;;) {
			if (!parent) break;
			if (parent?.type === "BlockStmt") {
				return parent as unknown as UnitNodeInstance<BlockStmt>;
			}
			parent = parent.parent;
		}
		return parent;
	}
}

function createUnitNode<T>(obj: T): UnitNodeInstance<T> {
	return new UnitNode(obj) as unknown as UnitNodeInstance<T>;
}

export default createUnitNode;
