import { Token, TokenType } from "@/keywords";
import { Literal } from "@/node";
import toRealValue from "./toRealValue";

export class TokenUnit {
	_token: Token;
	constructor(token: Token) {
		this._token = token;
	}
	vaildBaseType(token: Token) {
		if (typeof token !== "object") return token;
		const baseType = [
			TokenType.number,
			TokenType.string,
			TokenType.boolean
		];
		const isBase = baseType.includes(token.type);
		if (!isBase)
			throw new Error(`Unknown literal type: ${JSON.stringify(token)}`);
		return isBase;
	}
	add(token: Token) {
		this.vaildBaseType(token);
		let left, right;
		if (this._token.type == TokenType.number) {
			left = Number(this._token.value);
		} else {
			left = this._token.value;
		}
		if (typeof token !== "object") {
			right = token;
		} else {
			if (token.type == TokenType.number) {
				right = Number(token.value);
			} else {
				right = token.value;
			}
		}

		this._token = { ...this._token, value: left + right };
		return this;
	}
	sub(token: Token) {
		this.vaildBaseType(token);
		let left, right;
		if (this._token.type == TokenType.number) {
			left = Number(this._token.value);
		} else {
			left = this._token.value;
		}
		if (typeof token !== "object") {
			right = token;
		} else {
			if (token.type == TokenType.number) {
				right = Number(token.value);
			} else {
				right = token.value;
			}
		}

		this._token = { ...this._token, value: (left - right).toString() };
		return this;
	}
	mul(token: Token) {
		this.vaildBaseType(token);
		let left, right;
		if (this._token.type == TokenType.number) {
			left = Number(this._token.value);
		} else {
			left = this._token.value;
		}
		if (typeof token !== "object") {
			right = token;
		} else {
			if (token.type == TokenType.number) {
				right = Number(token.value);
			} else {
				right = token.value;
			}
		}

		this._token = { ...this._token, value: (left * right).toString() };
		return this;
	}
	div(token: Token) {
		this.vaildBaseType(token);
		let left, right;
		if (this._token.type == TokenType.number) {
			left = Number(this._token.value);
		} else {
			left = this._token.value;
		}
		if (typeof token !== "object") {
			right = token;
		} else {
			if (token.type == TokenType.number) {
				right = Number(token.value);
			} else {
				right = token.value;
			}
		}
		this._token = { ...this._token, value: (left / right).toString() };
		return this;
	}
	logicOperate(operator: Token, rightToken: Literal) {
		const left = toRealValue(this._token);
		const right = toRealValue(rightToken);
		const res = ((): boolean => {
			switch (operator.value) {
				case "==":
					return left == right;
				case "!=":
					return left != right;
				case ">":
					return left > right;
				case "<":
					return left < right;
				case ">=":
					return left >= right;
				case "<=":
					return left >= right;
			}
		})();

		this._token = {
			...this._token,
			type: TokenType.boolean,
			value: res.toString()
		};
		return this;
	}
	getToken() {
		return this._token;
	}
}

export default TokenUnit;
