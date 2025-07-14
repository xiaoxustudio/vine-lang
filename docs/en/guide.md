---
title: Guide
---

# Introduction

`Vine` is an interpreted programming language designed for ease of use and learning. It is a simple language built on TypeScript but with more modern syntax and features.

## Installation

```bash
npm install vine-lang
# or
pnpm add vine-lang
```

## Usage

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

//  ...more , you can see the example in vine repository
``` 