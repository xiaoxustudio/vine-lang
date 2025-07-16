import { Keywords, Token, TokenType } from "@/keywords";

export const isDigit = (ch: string) => /\d/.test(ch);
export const isAlpha = (ch: string) => /[\u4e00-\u9fa5a-zA-Z_]/.test(ch);
export const isOperator = (ch: string) => /[+\-*/%=<>!&|]/.test(ch);
export const isKeyword = (word: string) => Object.keys(Keywords).includes(word);
export const isComment = (ch: string) => ch === "#";
export const isSkip = (ch: string) => [" ", "\t", "\r"].includes(ch);
export const isString = (ch: string) => ["'", '"'].includes(ch);

export function tokenlize(code: string): Token[] {
	const tokens: Token[] = [];
	const lines = code.split("\n");
	let lineNum = 1;
	let colNum = 1;
	let inMultilineComment = false; // 是否在多行注释中
	let multilineCommentContent = "";

	const addToken = (type: TokenType, value: string) => {
		tokens.push({ type, value, line: lineNum, column: colNum });
		colNum += value.length;
	};

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		colNum = 1;
		for (let j = 0; j < line.length; j++) {
			const ch = line[j];
			
			if (inMultilineComment) {
				if (ch === '*' && j + 1 < line.length && line[j + 1] === '#') {
					multilineCommentContent += '*#';
					addToken(TokenType.comment, multilineCommentContent);
					inMultilineComment = false;
					multilineCommentContent = "";
					j++;
					continue;
				}
				multilineCommentContent += ch;
				continue;
			}

			if (isDigit(ch)) {
				let num = ch;
				j++;
				while (j < line.length && isDigit(line[j])) {
					num += line[j];
					j++;
				}
				j--;
				addToken(TokenType.number, num);
			} else if (isAlpha(ch)) {
				let word = ch;
				j++;
				while (j < line.length && (isAlpha(line[j]) || isDigit(line[j]))) {
					word += line[j];
					j++;
				}
				j--;
				if (isKeyword(word)) {
					const keyword = Keywords[word as keyof typeof Keywords];
					if (keyword === TokenType.boolean) {
						addToken(TokenType.boolean, word);
					} else {
						addToken(keyword, word);
					}
				} else {
					addToken(TokenType.identifier, word);
				}
			} else if (isOperator(ch)) {
				addToken(TokenType.operator, ch);
			} else if (isComment(ch)) {
				// Check for multiline comment start
				if (j + 1 < line.length && line[j + 1] === '*') {
					inMultilineComment = true;
					multilineCommentContent = "#*";
					j++;
					continue;
				}
				// Single line comment
				let comment = ch;
				j++;
				while (j < line.length) {
					comment += line[j];
					j++;
				}
				j--;
				addToken(TokenType.comment, comment);
			} else if (["(", ")"].includes(ch)) {
				addToken(TokenType.paren, ch);
			} else if (["[", "]"].includes(ch)) {
				addToken(TokenType.bracket, ch);
			} else if (["{", "}"].includes(ch)) {
				addToken(TokenType.curly, ch);
			} else if (ch === ",") {
				addToken(TokenType.comma, ch);
			} else if (ch === "?") {
				addToken(TokenType.question, ch);
			} else if (ch === ":") {
				addToken(TokenType.colon, ch);
			} else if (ch === ".") {
				addToken(TokenType.dot, ch);
			} else if (isString(ch)) {
				let str = "";
				j++;
				while (j < line.length && !isString(line[j])) {
					str += line[j];
					j++;
				}
				addToken(TokenType.string, str);
			} else if (!isSkip(ch)) {
				throw `Unknown char : ${ch}`;
			}
			colNum++;
		}
		if (inMultilineComment) {
			multilineCommentContent += "\n";
		}
		lineNum++;
	}
	
	if (inMultilineComment) {
		throw "Unterminated multiline comment";
	}
	
	return tokens;
}
