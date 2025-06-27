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
