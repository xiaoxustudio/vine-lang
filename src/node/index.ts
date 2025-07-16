import { Token } from "@/keywords";

export type NodeType =
	| "Program"
	| "Literal"
	| "Property"
	| "CommentStatement"
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
}

export interface Expr extends Node {}

export interface Literal extends Expr {
	value: Token;
	type: "Literal";
}

export interface Property extends Node {
	key: Literal;
	value: Expr;
	type: "Property";
}

export interface TemplateElement extends Node {
	value: Literal;
	type: "TemplateElement";
}

/* ================================== Declaration ================================== */

export interface UseSpecifier extends Node {
	remote: Literal;
	local: Literal;
	type: "UseSpecifier";
}

export interface UseDefaultSpecifier extends Node {
	local: Literal;
	type: "UseDefaultSpecifier";
}

export interface UseDecl extends Node {
	type: "UseDeclaration";
	source: Literal;
	specifiers: (UseSpecifier | UseDefaultSpecifier)[];
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

export interface VariableDecl extends Node {
	id: Literal;
	value: Expr;
	type: "VariableDeclaration";
}

/* ================================== Expr ================================== */

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

export interface TernaryExpr extends Expr {
	condition: Expr;
	consequent: Expr;
	alternate: Expr;
	type: "TernayExpression";
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
	property: Expr | Expr[];
	type: "MemberExpression";
	computed: boolean; // [] or .value
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

export interface ToExpr extends Expr {
	body: BlockStmt;
	arguments: Expr[];
	type: "ToExpression";
}

export interface TemplateLiteralExpr extends Expr {
	type: "TemplateLiteralExpression";
	quotes: (TemplateElement | Literal)[];
}

/* ================================== Stmt ================================== */

export interface CommentStmt extends Node {
	value: Token;
	type: "CommentStatement";
}

export interface RunStmt extends Expr {
	callee: CallExpr;
	to: ToExpr[];
	type: "RunStatement";
}

export interface ExposeStmt extends Node {
	body: Expr;
	specifiers: Expr[];
	type: "ExposeStmtement";
}

export interface BlockStmt extends Node {
	body: Expr[];
	type: "BlockStatement";
}

export interface CaseBlockStmt extends Node {
	body: BlockStmt;
	test: Expr;
	type: "CaseBlockStatement";
}

export interface DefaultCaseBlockStmt extends Node {
	body: BlockStmt;
	test: Expr;
	type: "DefaultCaseBlockStatement";
}

export interface ReturnStmt extends Node {
	value: Expr;
	type: "ReturnStatement";
}

export interface ProgramStmt extends Node {
	body: Expr[];
	type: "Program";
}

export interface IfStmt extends Node {
	test: Expr;
	consequent: BlockStmt;
	alternate?: BlockStmt;
	type: "IfStatement";
}

export interface ForStmt extends Node {
	init: Expr;
	value?: Expr;
	range: RangeExpr;
	update: Expr;
	body: BlockStmt;
	type: "ForStatement";
}

export interface SwitchStmt extends Node {
	test: Expr;
	cases: (DefaultCaseBlockStmt | CaseBlockStmt)[];
	type: "SwitchStmtement";
}

export interface ExpressionStmt extends Node {
	expression: Expr;
	type: "ExpressionStatement";
}

export interface TaskStmt extends Node {
	fn: FunctionDecl;
	type: "TaskStatement";
}

export interface WaitStmt extends Node {
	type: "WaitStatement";
	async: RunStmt;
}
