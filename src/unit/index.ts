/* 操作单元（操作Node） */

import { BlockStmt, UnitNodeInstance } from "@/node";

class UnitNode<T> {
	readonly origin: T;
	constructor(obj: T) {
		Object.assign(this, obj);
		this.origin = obj;
	}
	// 查找上级作用域中的块
	findBlock(): UnitNodeInstance<BlockStmt> | null {
		return null;
	}
}

function createUnitNode<T>(obj: T): UnitNodeInstance<T> {
	return new UnitNode(obj) as unknown as UnitNodeInstance<T>;
}

export default createUnitNode;
