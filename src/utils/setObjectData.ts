export default function (obj: any, prop: string, value: any) {
	return Object.defineProperty(obj, prop, {
		value,
		enumerable: true,
		writable: false,
		configurable: false,
	});
}
