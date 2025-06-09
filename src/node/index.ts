import { Token } from "@/keywords";

export type NodeType =
	| "Program"
	| "BinaryExpression"
	| "Literal"
	| "Property"
	| "ArrayExpression"
	| "ObjectExpression"
	| "MemberExpression"
	| "CallExpression"
	| "BlockStatement"
	| "FunctionDeclaration"
	| "LambdaFunctionDecl"
	| "VariableDeclaration"
	| "ExpressionStatement"
	| "AssignmentExpression"
	| "CompareExpression"
	| "EqualExpression"
	| "RangeExpression"
	| "IfStatement"
	| "ForStatement";

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

export interface LambdaFunctionDecl extends Node {
	arguments: Expr[];
	body: BlockStmt;
	type: "LambdaFunctionDecl";
}

export interface RangeExpr extends Expr {
	start: Expr;
	end: Expr;
	step: Token;
	type: "RangeExpression";
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

export interface ForStmt extends Node {
	init: Expr;
	range: RangeExpr;
	update: Expr;
	body: BlockStmt;
	type: "ForStatement";
}

export interface ExpressionStmt extends Node {
	expression: Expr;
	type: "ExpressionStatement";
}

export interface Property extends Node {
	key: Literal;
	value: Expr;
	type: "Property";
}

export interface ObjectExpr extends Node {
	properties: Property[];
	type: "ObjectExpression";
}

export interface ArrayExpr extends Node {
	items: Property[];
	type: "ArrayExpression";
}

export interface MemberExpr extends Expr {
	object: Expr;
	property: Expr[];
	type: "MemberExpression";
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
