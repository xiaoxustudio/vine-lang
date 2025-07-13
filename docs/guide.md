---
title: 向导
---

# 简介

`Vine (藤蔓) `是一种旨在便于使用和学习的解释型编程语言。它是一种简单的语言，基于 TypeScript 构建，但具有更现代的语法和功能。


## 安装

```bash
npm install vine-lang
# or
pnpm add vine-lang

```

## 使用

```typescript
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

