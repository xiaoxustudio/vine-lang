import { TokenType } from "@/keywords";
import { isNode } from "@/utils";
import { expect, test } from "vitest";

test("is node", () => {
	expect(isNode({ type: "Program" })).toBe(true);
	expect(isNode({ type: TokenType.string })).toBe(false);
});
