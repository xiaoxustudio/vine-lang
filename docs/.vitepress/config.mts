import { defineConfig } from "vitepress";
import { join } from "path";
import fs from "fs";

const vineGrammar = JSON.parse(
	fs.readFileSync(join(__dirname, "./vine-language.tmLanguage.json"), "utf8")
);

const libs = fs.readdirSync(join(__dirname, "../src/libs")).map(file => {
	return {
		text: file.split(".")[0],
		link: `/src/libs/${file.split(".")[0]}`,
	};
});

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
	locales: {
		root: {
			label: "简体中文",
			lang: "zh-CN",
			link: "/",
			themeConfig: {
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
					{
						text: "内置模块",
						items: libs,
					},
				],
			},
		},
		en: {
			label: "English",
			lang: "en",
			link: "/en/",
			themeConfig: {
				nav: [{ text: "Home", link: "/en/" }],
				sidebar: [
					{
						text: "Guide",
						link: "/en/guide",
					},
					{
						text: "Usage",
						items: [
							{
								text: "Basics",
								link: "/en/src/base",
							},
							{
								text: "Functions",
								link: "/en/src/fn",
							},
							{
								text: "Conditions",
								link: "/en/src/condition",
							},
							{
								text: "Loops",
								link: "/en/src/for",
							},
							{
								text: "Switch",
								link: "/en/src/switch",
							},
							{
								text: "Import",
								link: "/en/src/use",
							},
							{
								text: "Tasks",
								link: "/en/src/task",
							},
						],
					},
					{
						text: "Built-in Modules",
						items: libs.map(lib => ({
							...lib,
							text: lib.text[0].toUpperCase() + lib.text.slice(1),
							link: lib.link.replace("/src/", "/en/src/"),
						})),
					},
				],
			},
		},
	},
	themeConfig: {
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
