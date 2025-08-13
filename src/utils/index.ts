import { Expr, Literal } from "@/node";
import { Token, TokenType } from "@/keywords";
import Environment from "@/environment";
import { ModuleTag } from "@/libs/package";

export const BaseDataTag = {
	OBJECT: Symbol("object"),
	ARRAY: Symbol("array"),
	RANGE: Symbol("range"),
	FN: Symbol("function"),
	FN_TASK: Symbol("function_async"),
	FN_LAMBDA: Symbol("function_lambda")
};
const MapNodeType = [
	"Program",
	"Literal",
	"Property",
	"CommentStatement",
	"EmptyLine",
	/* Declaration */
	"LambdaFunctionDecl",
	"FunctionDeclaration",
	"VariableDeclaration",
	"UseDeclaration",
	"UseSpecifier",
	"UseDefaultSpecifier",
	"TemplateElement",
	/* expr */
	"BinaryExpression",
	"ArrayExpression",
	"ObjectExpression",
	"MemberExpression",
	"CallExpression",
	"AssignmentExpression",
	"CompareExpression",
	"EqualExpression",
	"TernayExpression",
	"RangeExpression",
	"IterableExpression",
	"ToExpression",
	"TemplateLiteralExpression",
	/* stmt */
	"RunStatement",
	"WaitStatement",
	"TaskStatement",
	"BlockStatement",
	"ReturnStatement",
	"ExpressionStatement",
	"IfStatement",
	"ForStatement",
	"SwitchStmtement",
	"CaseBlockStatement",
	"DefaultCaseBlockStatement",
	"ExposeStmtement"
];
export function isNode(stmt: any) {
	return MapNodeType.includes(stmt?.type);
}

export function isToken(expr: Expr) {
	return Object.keys(TokenType).includes(expr?.type);
}

export function isNilLiteral(expr: Literal) {
	const token = expr?.type === "Literal" ? expr.value : expr;
	return token?.type === TokenType.nil;
}

export function isNil(input: any) {
	return input === null || typeof input === "undefined" || input === "nil";
}

export function isBuilInObject(expr: Token | Expr) {
	return expr instanceof Environment || expr.type === TokenType.env;
}

export function isFunction(fn: any) {
	return (
		fn?.type === BaseDataTag.FN ||
		fn?.type === BaseDataTag.FN_TASK ||
		typeof fn === "function"
	);
}

export function isInSideModule(_: Record<string, any>) {
	return (
		Reflect.has(_, "__module__") &&
		Reflect.get(_, "__module__") === ModuleTag
	);
}

export function isClass(fn: Object) {
	if (typeof fn !== "function") return false;

	try {
		fn();
	} catch (e) {
		if (e instanceof TypeError) {
			const descriptor =
				Object.getOwnPropertyDescriptor(fn.prototype, "constructor") ||
				{};
			if (descriptor.enumerable === false) return true;
		}
	}
	return /^\s*class[\s{]/.test(fn.toString());
}

export function isPromise(value: any) {
	if (
		value === null ||
		(typeof value !== "object" && typeof value !== "function")
	) {
		return false;
	}

	if (typeof Promise === "function" && value instanceof Promise) {
		return true;
	}

	if (Object.prototype.toString.call(value) === "[object Promise]") {
		return true;
	}

	try {
		return typeof value.then === "function";
	} catch (e) {
		return false;
	}
}
