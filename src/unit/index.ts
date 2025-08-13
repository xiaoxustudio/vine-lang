/* 操作单元（操作Node） */

import { BlockStmt, NodeType, Node, UnitNodeInstance } from "@/node";

class UnitNode<T extends Node> {
	readonly __origin: T;
	readonly type: NodeType;

	get parent(): UnitNodeInstance<BlockStmt> | null {
		return null;
	}

	constructor(obj: T) {
		Object.assign(this, obj);
		this.type = obj.type;

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
		Object.defineProperty(obj, "__origin", {
			value: true,
			enumerable: true,
			configurable: true,
			writable: false
		});
	}

	/**
	 * @description: 获取节点的类型
	 * @return {NodeType} 节点类型
	 */
	getType(): NodeType {
		return this.type;
	}

	/**
	 * @description: 遍历当前节点的所有子节点
	 * @param {function} callback - 处理每个子节点的回调函数
	 */
	traverseChildren(callback: (node: UnitNodeInstance<Node>) => void): void {
		const traverse = (obj: any) => {
			for (const key in obj) {
				const value = obj[key];
				if (Array.isArray(value)) {
					value.forEach((item) => {
						if (
							item &&
							typeof item === "object" &&
							"type" in item
						) {
							callback(item as UnitNodeInstance<Node>);
							traverse(item);
						}
					});
				} else if (
					value &&
					typeof value === "object" &&
					"type" in value
				) {
					callback(value as UnitNodeInstance<Node>);
					traverse(value);
				}
			}
		};
		traverse(this);
	}

	/**
	 * @description: 查找特定类型的节点
	 * @param {NodeType} type - 要查找的节点类型
	 * @return {UnitNodeInstance<Node>[]} 找到的所有匹配节点
	 */
	findNodesByType(type: NodeType): UnitNodeInstance<Node>[] {
		const results: UnitNodeInstance<Node>[] = [];
		this.traverseChildren((node) => {
			if (node.type === type) {
				results.push(node);
			}
		});
		return results;
	}

	/**
	 * @description: 替换当前节点为新节点
	 * @param {Node} newNode - 新的节点
	 * @return {boolean} 替换是否成功
	 */
	replaceWith(newNode: Node): boolean {
		if (!this.parent) return false;

		const parent = this.parent;
		for (const key in parent) {
			const value = (parent as any)[key];
			if (Array.isArray(value)) {
				const index = value.findIndex((item) => item === this);
				if (index !== -1) {
					value[index] = createUnitNode(newNode);
					return true;
				}
			} else if (value === this) {
				(parent as any)[key] = createUnitNode(newNode);
				return true;
			}
		}
		return false;
	}

	/**
	 * @description: 查找上级作用域中的块
	 * @return {UnitNodeInstance<BlockStmt> | null} 找到的块级作用域
	 */
	findBlock(): UnitNodeInstance<BlockStmt> | null {
		let parent = this.parent;
		for (;;) {
			if (!parent) break;
			if (parent?.type === "BlockStatement") {
				return parent as unknown as UnitNodeInstance<BlockStmt>;
			}
			parent = parent.parent;
		}
		return parent;
	}
}

function createUnitNode<T extends Node>(obj: T): UnitNodeInstance<T> {
	return new UnitNode(obj) as unknown as UnitNodeInstance<T>;
}

export default createUnitNode;
