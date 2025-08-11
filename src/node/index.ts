import { Token } from "@/keywords";

export type NodeType =
	| "Program"
	| "Literal"
	| "Property"
	| "CommentStatement"
	| "EmptyLine"
	/* Declaration */
	| "LambdaFunctionDecl"
	| "FunctionDeclaration"
	| "VariableDeclaration"
	| "UseDeclaration"
	| "UseSpecifier"
	| "UseDefaultSpecifier"
	| "TemplateElement"
	/* expr */
	| "BinaryExpression"
	| "ArrayExpression"
	| "ObjectExpression"
	| "MemberExpression"
	| "CallExpression"
	| "AssignmentExpression"
	| "CompareExpression"
	| "EqualExpression"
	| "TernayExpression"
	| "RangeExpression"
	| "IterableExpression"
	| "ToExpression"
	| "TemplateLiteralExpression"
	/* stmt */
	| "RunStatement"
	| "WaitStatement"
	| "TaskStatement"
	| "BlockStatement"
	| "ReturnStatement"
	| "ExpressionStatement"
	| "IfStatement"
	| "ForStatement"
	| "SwitchStmtement"
	| "CaseBlockStatement"
	| "DefaultCaseBlockStatement"
	| "ExposeStmtement";

export interface Node {
	type: NodeType;
	id?: UnitNodeInstance<Literal> | Token;
}

export interface Expr extends Node {}

export type UnitNodeInstance<T extends unknown> = T & {
	origin: T;
	parent: UnitNodeInstance<BlockStmt> | null;
	findBlock: () => UnitNodeInstance<BlockStmt> | null;
};

export interface Literal extends Expr {
	value: Token;
	type: "Literal";
}

export interface Property extends Node {
	key: UnitNodeInstance<Literal>;
	value: UnitNodeInstance<Expr>;
	type: "Property";
}

export interface TemplateElement extends Node {
	value: UnitNodeInstance<Literal>;
	type: "TemplateElement";
}

export interface EmptyLineStmt extends Node {
	type: "EmptyLine";
}

/* ================================== Declaration ================================== */

export interface UseSpecifier extends Node {
	remote: UnitNodeInstance<Literal>;
	local: UnitNodeInstance<Literal>;
	type: "UseSpecifier";
}

export interface UseDefaultSpecifier extends Node {
	local: UnitNodeInstance<Literal>;
	type: "UseDefaultSpecifier";
}

export interface UseDecl extends Node {
	type: "UseDeclaration";
	source: UnitNodeInstance<Literal>;
	specifiers: (UseSpecifier | UseDefaultSpecifier)[];
}

export interface FunctionDecl extends Node {
	preId: Token;
	id: UnitNodeInstance<Literal>;
	arguments: UnitNodeInstance<Expr>[];
	body: UnitNodeInstance<BlockStmt>;
	type: "FunctionDeclaration";
}

export interface LambdaFunctionDecl extends Node {
	arguments: UnitNodeInstance<Expr>[];
	body: UnitNodeInstance<BlockStmt>;
	type: "LambdaFunctionDecl";
}

export interface VariableDecl extends Node {
	preId: Token;
	id: UnitNodeInstance<Literal>;
	value: UnitNodeInstance<Expr>;
	type: "VariableDeclaration";
	is_const: boolean;
}

/* ================================== Expr ================================== */

export interface RangeExpr extends Expr {
	start: UnitNodeInstance<Expr>;
	end: UnitNodeInstance<Expr>;
	step: Token;
	type: "RangeExpression";
}

export interface EqualExpr extends Expr {
	left: UnitNodeInstance<Expr>;
	right: UnitNodeInstance<Expr>;
	operator: Token;
	type: "EqualExpression";
}

export interface CompareExpr extends Expr {
	left: UnitNodeInstance<Expr>;
	right: UnitNodeInstance<Expr>;
	operator: Token;
	type: "CompareExpression";
}

export interface CallExpr extends Expr {
	callee: UnitNodeInstance<Literal>;
	arguments: UnitNodeInstance<Expr>[];
	type: "CallExpression";
}

export interface AssignmentExpr extends Expr {
	left: UnitNodeInstance<Literal>;
	right: UnitNodeInstance<Expr>;
	operator: Token;
	type: "AssignmentExpression";
}

export interface TernaryExpr extends Expr {
	condition: UnitNodeInstance<Expr>;
	consequent: UnitNodeInstance<Expr>;
	alternate: UnitNodeInstance<Expr>;
	type: "TernayExpression";
}

export interface ObjectExpr extends Node {
	properties: UnitNodeInstance<Property>[];
	type: "ObjectExpression";
}

export interface ArrayExpr extends Node {
	items: UnitNodeInstance<Property>[];
	type: "ArrayExpression";
}

export interface MemberExpr extends Expr {
	object: UnitNodeInstance<Expr>;
	property: UnitNodeInstance<Expr> | UnitNodeInstance<Expr>[];
	type: "MemberExpression";
	computed: boolean; // [] or .value
}

export interface AssignmentExpr extends Expr {
	left: UnitNodeInstance<Literal>;
	right: UnitNodeInstance<Expr>;
	operator: Token;
	type: "AssignmentExpression";
}

export interface BinaryExpr extends Expr {
	left: UnitNodeInstance<Expr>;
	right: UnitNodeInstance<Expr>;
	operator: Token;
}

export interface ToExpr extends Expr {
	body: UnitNodeInstance<BlockStmt>;
	arguments: UnitNodeInstance<Expr>[];
	type: "ToExpression";
}

export interface TemplateLiteralExpr extends Expr {
	type: "TemplateLiteralExpression";
	quotes: UnitNodeInstance<TemplateElement | Expr>[];
}

/* ================================== Stmt ================================== */

export interface CommentStmt extends Node {
	value: Token;
	type: "CommentStatement";
}

export interface RunStmt extends Expr {
	callee: UnitNodeInstance<CallExpr>;
	to: UnitNodeInstance<ToExpr>[];
	type: "RunStatement";
}

export interface ExposeStmt extends Node {
	id: Token;
	body: UnitNodeInstance<Expr>;
	specifiers: UnitNodeInstance<Expr>[];
	type: "ExposeStmtement";
}

export interface BlockStmt extends Node {
	body: UnitNodeInstance<Expr>[];
	type: "BlockStatement";
}

export interface CaseBlockStmt extends Node {
	body: UnitNodeInstance<BlockStmt>;
	test: UnitNodeInstance<Expr>;
	type: "CaseBlockStatement";
}

export interface DefaultCaseBlockStmt extends Node {
	body: UnitNodeInstance<BlockStmt>;
	test: UnitNodeInstance<Expr>;
	type: "DefaultCaseBlockStatement";
}

export interface ReturnStmt extends Node {
	value: UnitNodeInstance<Expr>;
	type: "ReturnStatement";
}

export interface ProgramStmt extends Node {
	body: UnitNodeInstance<Expr>[];
	type: "Program";
}

export interface IfStmt extends Node {
	test: UnitNodeInstance<Expr>;
	consequent: UnitNodeInstance<BlockStmt>;
	alternate?: UnitNodeInstance<BlockStmt>;
	type: "IfStatement";
}

export interface ForStmt extends Node {
	init: UnitNodeInstance<Expr>;
	value?: UnitNodeInstance<Expr>;
	range: UnitNodeInstance<RangeExpr>;
	update: UnitNodeInstance<Expr>;
	body: UnitNodeInstance<BlockStmt>;
	type: "ForStatement";
}

export interface SwitchStmt extends Node {
	test: UnitNodeInstance<Expr>;
	cases: UnitNodeInstance<DefaultCaseBlockStmt | CaseBlockStmt>[];
	type: "SwitchStmtement";
}

export interface ExpressionStmt extends Node {
	expression: UnitNodeInstance<Expr>;
	type: "ExpressionStatement";
}

export interface TaskStmt extends Node {
	fn: UnitNodeInstance<FunctionDecl>;
	type: "TaskStatement";
}

export interface WaitStmt extends Node {
	type: "WaitStatement";
	async: UnitNodeInstance<RunStmt>;
}
