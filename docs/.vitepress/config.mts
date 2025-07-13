import { defineConfig } from "vitepress";
import { join } from "path";
import fs from "fs";

const vineGrammar = JSON.parse(
	fs.readFileSync(join(__dirname, "./vine-language.tmLanguage.json"), "utf8")
);

// https://vitepress.dev/reference/site-config
export default defineConfig({
	title: "Vine Language",
	description: "An interpreted language based on TypeScript",
	base: "/vine-lang/",
	markdown: {
		async shikiSetup(highlighter) {
			await highlighter.loadLanguage(vineGrammar);
		},
	},
	themeConfig: {
		// https://vitepress.dev/reference/default-theme-config
		nav: [{ text: "首页", link: "/" }],
		sidebar: [
			{
				text: "向导",
				link: "/guide",
			},
			{
				text: "用法",
				items: [
					{
						text: "基础",
						link: "/src/base",
					},
					{
						text: "函数",
						link: "/src/fn",
					},
					{
						text: "条件控制",
						link: "/src/condition",
					},
					{
						text: "循环",
						link: "/src/for",
					},
					{
						text: "分支",
						link: "/src/switch",
					},
					{
						text: "导入",
						link: "/src/use",
					},
					{
						text: "任务",
						link: "/src/task",
					},
				],
			},
		],
		socialLinks: [
			{ icon: "github", link: "https://github.com/xiaoxustudio/vine-lang" },
		],
		footer: {
			copyright: "Copyright © 2025-present xuran",
			message: "MIT Licensed",
		},
	},
	vite: {
		server: {
			port: 5656,
		},
	},
});
