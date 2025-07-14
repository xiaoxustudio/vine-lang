---
title: Switch Statement
---

# Switch Statement

```vine
let a = 1
switch a:
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

Default Statement

```vine
let calc = fn(num):
    switch num:
        case 1:
            return "it's 1"
        case 2:
            return "it's 2"
        default:
            return "neither 1 nor 2"
    end
end

print(calc(1))
print(calc(4))
``` 