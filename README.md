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

`Vine` is an interpreted programming language designed for ease of use and learning. It is a simple language built on TypeScript but features a more modern syntax and functionality.

# Install

```bash
npm install vine-lang
# or
pnpm add vine-lang
```

# Use

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

# Develop

The project uses `pnpm` as the package manager.

```bash
pnpm install
```

Local run

```bash
pnpm run dev
```

## Build

Build exe

```bash
pnpm run build
```

## Repl

Vine offers the `repl` function, allowing you to directly run code in the command line.

```bash
pnpm run repl

Vine > print("Hello, World!")
```

## Interpret

It is also possible to run code files with the suffix `.vine`

```bash
pnpm ipt <path>
```

# Regarding

Author: [Xu Ran](https://github.com/xiaoxustudio)

Contact Information: [xugame@qq.com](mailto:xugame@qq.com)

Please feel free to raise your valuable "issue", and we will handle it.

# LICENSE

[MIT](./LICENSE)
