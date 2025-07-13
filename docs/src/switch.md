---
title: 分支
---

# 分支

```vine
let a = 1
switch a :
    case 1:
        print("1")
    break
    case 2:
        print("2")
    break
    case 3:
        print("3")
    break
    case 4:
        print("4")
    break
    case 5:
        print("5")
    break
end
```

默认语句

```vine
let calc = fn(num):
    switch num :
        case 1:
            return "是1"
        case 2:
            return "是2"
        default:
            return "不是1也不是2"
    end
end

print(calc(1))
print(calc(4))
```
