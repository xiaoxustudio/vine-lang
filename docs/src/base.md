---
title: 基础
---

# 基础

vine 语法非常简单，融合了lua和js的语法，并添加了一些新的特性。

### 注释

单行注释

```vine
# 我是一条注释

let a = 1
```
多行注释

```vine
#*
  我是多行注释
*#

let a = 1
```

### 变量

目前使用`let`关键字声明，变量名可以包含字母、数字和下划线，但不能以数字开头。

```vine
let a = 1
let b = 2
let c = a + b
```


### 数组

```vine
let arr = [1, 2, 3, 4, 5]
```

### 字典

```vine
let dict = {"a": 1, "b": 2, "c": 3}
```


### 模板字符串

```vine
let name = "world"
let str = "hello, {{name}}"
```
