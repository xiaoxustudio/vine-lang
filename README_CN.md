<p align="center">
<img alt="logo" src="./docs/public/Vine.png" width="120" style="margin-bottom: 10px;">
</p>

<h2 align="center">Vine Language</h2>

<p align="center">
<img alt="NPM Downloads" src="https://img.shields.io/npm/dm/vine-lang">
<img alt="NPM Version" src="https://img.shields.io/npm/v/vine-lang">
<img alt="logo" src="https://img.shields.io/badge/license-MIT-blue.svg">
</p>

- [简体中文](./README_CN.md)
- [English](./README.md)

`Vine` (藤蔓) 是一种旨在便于使用和学习的解释型编程语言。它是一种简单的语言，基于 TypeScript 构建，但具有更现代的语法和功能。

<img width="300"  alt="image" src="https://github.com/user-attachments/assets/404b5727-198d-4a49-be55-af4ed1d5e188" />
<img  width="260" alt="image" src="https://github.com/user-attachments/assets/c7cdbcb1-6cd5-47ae-95d4-cd9f023bcbac" />
<img width="200"  alt="image" src="https://github.com/user-attachments/assets/bca31030-00f2-4a1e-941e-70cf0e80fe2c" />

# 安装

```bash
npm install vine-lang
# or
pnpm add vine-lang
```

# 使用

```ts
import { Vine } from "vine-lang";

const vine = new Vine();
vine.run(`
    print("Hello, World!")
`);
const result = vine.run(`1 + 2`);
console.log(result); // 3

const result2 = vine.run(`"Hello, " + "World!"`);
console.log(result2); // Hello, World!

const result3 = vine.run(`
    fn a(num):
        return num + 1
    end
    a(1)
`);
console.log(result3); // 2

//  ...more , you can see the example in vine respository
```

VSCode插件语言支持: [vine-for-vscode](https://github.com/xiaoxustudio/vine-for-vscode)

# 项目

项目使用 pnpm 作为包管理器

```bash
pnpm install
```

## 开发

本地运行

```bash
pnpm run dev
```

## 构建

构建 exe

```bash
pnpm run exebuild
```

## 交互

Vine 提供了 repl 功能，可以在命令行中直接运行代码

```bash
pnpm run repl

Vine > print("Hello, World!")
```

## 解释

同样也可以运行后缀名为`.vine`的代码文件

```bash
pnpm ipt <path>
```

# 关于

作者：[徐然](https://github.com/xiaoxustudio)

联系方式：[xugame@qq.com](emailto://xugame@qq.com)

欢迎提出您宝贵的 **issue**，我们将会处理。

# LICENSE

[MIT](./LICENSE)
