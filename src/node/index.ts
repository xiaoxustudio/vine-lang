import { Token } from "@/types";

export type NodeType =
	| "Program"
	| "BinaryExpression"
	| "Literal"
	| "MemberExpression"
	| "CallExpression"
	| "BlockStatement"
	| "FunctionDeclaration"
	| "VariableDeclaration"
	| "ExpressionStatement"
	| "AssignmentExpression"
	| "CompareExpression"
	| "EqualExpression"
	| "IfStatement";

export interface Node {
	type: NodeType;
}

export interface Expr extends Node {}

export interface Literal extends Expr {
	value: Token;
	type: "Literal";
}

export interface BlockStmt extends Node {
	body: Expr[];
	type: "BlockStatement";
}

export interface FunctionDecl extends Node {
	id: Literal;
	arguments: Expr[];
	body: BlockStmt;
	type: "FunctionDeclaration";
}

export interface EqualExpr extends Expr {
	left: Expr;
	right: Expr;
	operator: Token;
	type: "EqualExpression";
}

export interface CompareExpr extends Expr {
	left: Expr;
	right: Expr;
	operator: Token;
	type: "CompareExpression";
}

export interface CallExpr extends Expr {
	callee: Literal;
	arguments: Expr[];
	type: "CallExpression";
}

export interface AssignmentExpr extends Expr {
	left: Literal;
	right: Expr;
	operator: Token;
	type: "AssignmentExpression";
}

export interface ProgramStmt extends Node {
	body: Expr[];
	type: "Program";
}

export interface VariableDecl extends Node {
	id: Literal;
	value: Expr;
	type: "VariableDeclaration";
}

export interface IfStmt extends Node {
	test: Expr;
	consequent: BlockStmt;
	alternate?: BlockStmt;
	type: "IfStatement";
}

export interface ExpressionStmt extends Node {
	expression: Expr;
	type: "ExpressionStatement";
}
export interface AssignmentExpr extends Expr {
	left: Literal;
	right: Expr;
	operator: Token;
	type: "AssignmentExpression";
}

export interface BinaryExpr extends Expr {
	left: Expr;
	right: Expr;
	operator: Token;
}
