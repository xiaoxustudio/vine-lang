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
	let inMultilineComment = false;
	let multilineCommentContent = "";
	let multilineStartCol = 1;

	const addToken = (type: TokenType, value: string, tokenStartCol: number) => {
		tokens.push({ type, value, line: lineNum, column: tokenStartCol });
	};

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		for (let j = 0; j < line.length; j++) {
			const ch = line[j];

			if (inMultilineComment) {
				if (ch === '*' && j + 1 < line.length && line[j + 1] === '#') {
					multilineCommentContent += '*#';
					addToken(TokenType.comment, multilineCommentContent, multilineStartCol);
					inMultilineComment = false;
					multilineCommentContent = "";
					j++;
					colNum += 2;
					continue;
				}
				multilineCommentContent += ch;
				colNum++;
				continue;
			}

			if (isDigit(ch)) {
				const startCol = colNum;
				let num = ch;
				j++;
				while (j < line.length && isDigit(line[j])) {
					num += line[j];
					j++;
				}
				j--;
				addToken(TokenType.number, num, startCol);
				colNum += num.length;
			} else if (isAlpha(ch)) {
				const startCol = colNum;
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
						addToken(TokenType.boolean, word, startCol);
					} else {
						addToken(keyword, word, startCol);
					}
				} else {
					addToken(TokenType.identifier, word, startCol);
				}
				colNum += word.length;
			} else if (isOperator(ch)) {
				addToken(TokenType.operator, ch, colNum);
				colNum++;
			} else if (isComment(ch)) {
				const startCol = colNum;
				// Check for multiline comment start
				if (j + 1 < line.length && line[j + 1] === '*') {
					inMultilineComment = true;
					multilineCommentContent = "#*";
					multilineStartCol = startCol;
					j++;
					colNum += 2;
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
				addToken(TokenType.comment, comment, startCol);
				colNum += comment.length;
			} else if (["(", ")"].includes(ch)) {
				addToken(TokenType.paren, ch, colNum);
				colNum++;
			} else if (["[", "]"].includes(ch)) {
				addToken(TokenType.bracket, ch, colNum);
				colNum++;
			} else if (["{", "}"].includes(ch)) {
				addToken(TokenType.curly, ch, colNum);
				colNum++;
			} else if (ch === ",") {
				addToken(TokenType.comma, ch, colNum);
				colNum++;
			} else if (ch === "?") {
				addToken(TokenType.question, ch, colNum);
				colNum++;
			} else if (ch === ":") {
				addToken(TokenType.colon, ch, colNum);
				colNum++;
			} else if (ch === ".") {
				addToken(TokenType.dot, ch, colNum);
				colNum++;
			} else if (isString(ch)) {
				const startCol = colNum;
				let str = "";
				const quote = ch;
				j++;
				while (j < line.length && line[j] !== quote) {
					str += line[j];
					j++;
				}
				addToken(TokenType.string, str, startCol + 1);
				colNum += str.length + 2; // 加2是因为要包含引号
			} else if (isSkip(ch)) {
				colNum++;
			} else {
				throw `Unknown char : ${ch} at line ${lineNum}, column ${colNum}`;
			}
		}
		if (inMultilineComment) {
			multilineCommentContent += "\n";
		}
		lineNum++;
		colNum = 1;
	}

	if (inMultilineComment) {
		throw "Unterminated multiline comment";
	}
	return tokens;
}
