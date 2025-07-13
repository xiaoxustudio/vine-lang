---
title: 任务
---

# 任务

类似于异步函数

```vine
task fn a():
    print("函数a")
end


run a()
print("全局")

```

```
全局
函数a
```

# 连锁

```vine
task fn a():
    print("函数a")
end
task fn b(val):
    print("函数b：" + val)
end


run a()
to ():
    b(123)
end
```


# 任务等待

```vine
task fn a():
    print("函数a")
    return 1
end
task fn b(val):
    print("函数b：" + val)
    return 2
end


let data = wait run a()
to (res):
    return b(res)
end

print("全局：" + data) # 全局：2

```


