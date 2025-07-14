---
title: Tasks
---

# Tasks

Similar to Asynchronous Functions

```vine
task fn a():
    print("function a")
end

run a()
print("global")
```

Output:
```
global
function a
```

# Chaining

```vine
task fn a():
    print("function a")
end
task fn b(val):
    print("function b: " + val)
end

run a()
to ():
    b(123)
end
```

# Task Waiting

```vine
task fn a():
    print("function a")
    return 1
end
task fn b(val):
    print("function b: " + val)
    return 2
end

let data = wait run a()
to (res):
    return b(res)
end

print("global: " + data) # global: 2
``` 