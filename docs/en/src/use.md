---
title: Import
---

# Import

Importing from Other Files

fn.vine:
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

main.vine:
```vine
use "./fn"

let a = 1
let b = 1

print(add(a,b))
print(add(aa,b))
print(sub(aa,b))
```

# Named Import

```vine
use "./fn" as fmodule

let a = 1
let b = 1

print(fmodule.add(a,b))
print(fmodule.add(fmodule.aa,b))
```

# Partial Import

```vine
use "./fn" pick (add as fadd,aa)

let a = 1
let b = 1

print(fadd(a,b))
print(fadd(aa,b))
``` 