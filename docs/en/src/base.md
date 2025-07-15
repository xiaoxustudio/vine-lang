---
title: Basics
---

# Basics

Vine's syntax is very simple, combining elements from Lua and JavaScript while adding some new features.

### Comments

Currently, only single-line comments are supported. Multi-line comments are not yet supported.

```vine
# I am a comment
```

### Variables

Variables are declared using the `let` keyword. Variable names can contain letters, numbers, and underscores, but cannot start with a number.

```vine
let a = 1
let b = 2
let c = a + b
```

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
