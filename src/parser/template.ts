import { Token, TokenType } from "@/keywords";
import { Literal, TemplateLiteralExpr } from "@/node";
import createUnitNode from "@/unit";
import Parser from ".";
import { tokenlize } from "@/token";

class TemplateStringParser {
	token: Token;
	index: number;
	_parser: Parser;
	constructor(token: Token) {
		this.token = token;
		this.index = 0;
	}
	parse(): TemplateLiteralExpr["quotes"] {
		const textArr = this.token.value.split("");
		const quotes: TemplateLiteralExpr["quotes"] = [];
		let strs = ""; // 前导字符串
		let escape = false;
		while (this.index <= textArr.length - 1) {
			const char = textArr[this.index];
			if (char === "\\" || escape) {
				this.index++;
				if (textArr[this.index] === "\\") {
					escape = true;
					continue;
				}
				if (escape) {
					strs += textArr[this.index];
					escape = false;
				} else {
					strs += new Function(`return '\\${textArr[this.index]}'`)();
				}
				this.index++;
			} else if (char === "{") {
				if (textArr[this.index + 1] !== "{") {
					strs += char;
					this.index++;
					continue;
				}
				if (strs) {
					quotes.push(
						createUnitNode<Literal>({
							type: "Literal",
							value: {
								...this.token,
								type: TokenType.string,
								value: strs
							}
						})
					);
					strs = "";
				}
				let exprString = "";
				this.index += 2;
				while (textArr[this.index] !== "}") {
					exprString += textArr[this.index];
					this.index++;
				}
				if (
					textArr[this.index] !== "}" ||
					textArr[this.index + 1] !== "}"
				)
					throw new Error("The template string is not closed.");
				this.index += 2;
				// a template literal
				this._parser = new Parser();
				quotes.push(...this._parser.parse(tokenlize(exprString)).body);
			} else {
				strs += char;
				this.index++;
			}
		}
		if (strs) {
			quotes.push(
				createUnitNode<Literal>({
					type: "Literal",
					value: {
						...this.token,
						value: strs
					}
				})
			);
			strs = "";
		}
		return quotes;
	}
}
export default TemplateStringParser;
