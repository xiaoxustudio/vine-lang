## 想法合集

### 如何和原生 JS 交互

用 js 中的 class，在 js 中创建一个类，然后在脚本调用时，会创建一个对象并添加到本地环境，就可以使用其方法了

使用`use`关键字导入

```vine
use "vine" # 整体导入
use "vine:fs" # 指定导入
use "vine:fs" as vfs # 指定导入并重命名

use "./vine" # 导入指定文件
use "vine" as vn # 整体导入并重命名
use "vine" pick (fs as fs, path as path) # 指定多项导入并重命名

```

### 标准库的编写

其实标准库我更倾向于用`vine`自己本身来编写，所以尽量把底层的东西暴漏出来，并用`vine`来调用封装组合为标准库

### 实现异步

使用`task`关键字，在函数前加上`task`，然后使用`wait`关键字来等待异步函数的返回值

当我们定义了多个任务时，使用`run`关键字来执行任务，并使用`to`关键字来指定任务的异步回调函数，可指定多个回调函数，回调函数的参数为上一个任务的返回值

```vine
task fn main():
    print("hello world")
end
task fn foo():
    print("foo fn")
end
wait main();
wait foo();
```

链式调用
```vine
task fn main():
    print("hello world")
    return 1
end
task fn foo():
    print("foo fn")
    return 2
end
task fn bar():
    print("bar fn")
    return 3
end


run main()
to (res):
    print()
to (res):
    print(res)
to (res):
    print(res)
end
```




