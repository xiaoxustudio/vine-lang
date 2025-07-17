import Environment from "@/environment";
import { ModuleTag } from "../package";
import LiteralFn from "@/utils/LiteralFn";
import { LikeModule } from "../types";

export interface VineDateModule extends LikeModule {
	__obj: Date;
	getObj: Date;
	reset?: () => void;
	now: (this: Environment) => void;
	getDate?: (this: Environment) => void;
	getDay?: (this: Environment) => void;
	getFullYear?: (this: Environment) => void;
	getHours?: (this: Environment) => void;
	getMilliseconds?: (this: Environment) => void;
	getMinutes?: (this: Environment) => void;
	getMonth?: (this: Environment) => void;
	getSeconds?: (this: Environment) => void;
	getTime?: (this: Environment) => void;
	getTimezoneOffset?: (this: Environment) => void;
	getUTCDate?: (this: Environment) => void;
	getUTCDay?: (this: Environment) => void;
	getUTCFullYear?: (this: Environment) => void;
	getUTCHours?: (this: Environment) => void;
	getUTCMilliseconds?: (this: Environment) => void;
	getUTCMinutes?: (this: Environment) => void;
	getUTCMonth?: (this: Environment) => void;
	getUTCSeconds?: (this: Environment) => void;
	toJSON?: (this: Environment) => void;
	toDateString?: (this: Environment) => void;
	toISOString?: (this: Environment) => void;
	toLocaleDateString?: (this: Environment) => void;
	toLocaleString?: (this: Environment) => void;
	toLocaleTimeString?: (this: Environment) => void;
	toTimeString?: (this: Environment) => void;
	toUTCString?: (this: Environment) => void;
}

const date: VineDateModule = {
	__module__: ModuleTag,
	__obj: new Date(),
	get getObj() {
		return this.__obj;
	},
	now() {
		return LiteralFn(Date.now());
	},
};
date.reset = function () {
	date.__obj = new Date();
};
date.getDate = function () {
	return LiteralFn(date.getObj.getDate());
};
date.getDay = function () {
	return LiteralFn(date.getObj.getDay());
};
date.getFullYear = function () {
	return LiteralFn(date.getObj.getFullYear());
};
date.getHours = function () {
	return LiteralFn(date.getObj.getHours());
};
date.getMilliseconds = function () {
	return LiteralFn(date.getObj.getMilliseconds());
};
date.getMinutes = function () {
	return LiteralFn(date.getObj.getMinutes());
};
date.getMonth = function () {
	return LiteralFn(date.getObj.getMonth());
};
date.getSeconds = function () {
	return LiteralFn(date.getObj.getSeconds());
};
date.getTime = function () {
	return LiteralFn(date.getObj.getTime());
};
date.getTimezoneOffset = function () {
	return LiteralFn(date.getObj.getTimezoneOffset());
};
date.getUTCDate = function () {
	return LiteralFn(date.getObj.getUTCDate());
};
date.getUTCDay = function () {
	return LiteralFn(date.getObj.getUTCDay());
};
date.getUTCFullYear = function () {
	return LiteralFn(date.getObj.getUTCFullYear());
};
date.getUTCHours = function () {
	return LiteralFn(date.getObj.getUTCHours());
};
date.getUTCMilliseconds = function () {
	return LiteralFn(date.getObj.getUTCMilliseconds());
};
date.getUTCMinutes = function () {
	return LiteralFn(date.getObj.getUTCMinutes());
};
date.getUTCMonth = function () {
	return LiteralFn(date.getObj.getUTCMonth());
};
date.getUTCSeconds = function () {
	return LiteralFn(date.getObj.getUTCSeconds());
};
date.toDateString = function () {
	return LiteralFn(date.getObj.toDateString());
};
date.toISOString = function () {
	return LiteralFn(date.getObj.toISOString());
};
date.toLocaleDateString = function () {
	return LiteralFn(date.getObj.toLocaleDateString());
};
date.toLocaleString = function () {
	return LiteralFn(date.getObj.toLocaleString());
};
date.toLocaleTimeString = function () {
	return LiteralFn(date.getObj.toLocaleTimeString());
};
date.toTimeString = function () {
	return LiteralFn(date.getObj.toTimeString());
};
date.toUTCString = function () {
	return LiteralFn(date.getObj.toUTCString());
};
date.toJSON = function () {
	return LiteralFn(date.getObj.toJSON());
};

export default date;
