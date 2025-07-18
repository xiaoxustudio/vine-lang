---
title: Basics
---

# Basics

Vine's syntax is very simple, combining elements from Lua and JavaScript while adding some new features.

### Comments

single-line comments

```vine
# I am a comment

let a = 1
```

Multi-line comments

```vine
#*
I am a comment
*#

let a = 1
```


### Variables

Variables are declared using the `let` keyword. Variable names can contain letters, numbers, and underscores, but cannot start with a number.

```vine
let a = 1
let b = 2
let c = a + b
```

### Constants

Constants are declared using the `cst` keyword. Constants are similar to variables, but their values cannot be changed after they are declared.

```vine
cst PI = 3.14

### Arrays

```vine
let arr = [1, 2, 3, 4, 5]
```

### Dictionaries

```vine
let dict = {"a": 1, "b": 2, "c": 3}
``` 

### Template String

```vine
let name = "world"
let str = "hello, {{name}}"
```
