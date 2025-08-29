import { describe, it, expect, vi } from "vitest";
vi.mock("node:repl", () => {
	const start = vi.fn();
	return {
		default: { start },
		start
	};
});
import * as repl from "node:repl";
import { replProgram } from "@/repl";

describe("REPL Eval Function", () => {
	it("should return 123 when input is 123", async () => {
		await new Promise<void>((resolve, reject) => {
			(repl.start as any).mockImplementation((options: any) => {
				options.eval(
					"123",
					{},
					"repl",
					(err: Error | null, result: any) => {
						try {
							expect(err).toBeNull();
							expect(result).toEqual({
								column: 1,
								line: 1,
								type: 0,
								value: "123"
							});
							resolve();
						} catch (e) {
							reject(e);
						}
					}
				);
				return { close: vi.fn(), defineCommand: vi.fn() };
			});

			replProgram();
			(repl.start as any).mockReset();
		});
	});
});
