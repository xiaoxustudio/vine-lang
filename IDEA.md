## 想法合集

### 如何和原生 JS 交互

用 js 中的 class，在 js 中创建一个类，然后在脚本调用时，会创建一个对象并添加到本地环境，就可以使用其方法了

使用`use`关键字导入

```vine
use vine
use vine::fs
use vine::fs as fs, vine::path as path
use "./vine"
```

### 标准库的编写

其实标准库我更倾向于用`vine`自己本身来编写，所以尽量把底层的东西暴漏出来，并用`vine`来调用封装组合为标准库
