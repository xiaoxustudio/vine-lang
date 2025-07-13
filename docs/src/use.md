---
title: 导入
---

# 导入

导入其他文件

fn.vine：
```vine
let bb = 444

expose let aa = 123

expose fn add(a,b):
    return a + b
end


expose fn sub(a):
    return a - bb
end
```


main.vine：
```vine
use "./fn"

let a = 1
let b = 1

print(add(a,b))
print(add(aa,b))
print(sub(aa,b))
```

# 导入命名

```vine
use "./fn" as fmodule

let a = 1
let b = 1

print(fmodule.add(a,b))
print(fmodule.add(fmodule.aa,b))
```

# 导入部分

```vine
use "./fn" pick (add as fadd,aa)

let a = 1
let b = 1

print(fadd(a,b))
print(fadd(aa,b))

```