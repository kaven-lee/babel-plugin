# Babel插件
## Babel简介
babel一般都是用来转译 esnext、typescript、flow 等到目标环境支持的 js，当然babel能做的不只有这些，它还可以做一些其他有趣的功能，比如函数插桩、自动国际化、自动生成文档等等。。

现在比较流行的小程序转译工具 taro，就是基于 babel 的 api 来实现的。
## AST
先简单说一下AST，AST(抽象语法树)是babel的核心概念，AST 是对源码的抽象，字面量、标识符、表达式、语句、模块语法、class 语法都有各自的 AST。

https://astexplorer.net/
（详细怎么生成AST原理有兴趣后面讲）

## Babel的运行原理
Babel的工作过程经过三个阶段，parse、transform、generate
- parse阶段，将源代码转换为AST
- transform阶段，利用各种插件进行代码转换
- generator阶段，再利用代码生成工具，将AST转换成代码
#### Parse-解析

- Babel 使用 @babel/parser 解析代码，输入的 js 代码字符串根据 ESTree 规范生成 AST
- Babel 使用的解析器是 babylon
  
#### Transform-转换

- 接收 AST 并对其进行遍历，在此过程中对节点进行添加、更新及移除等操作。也是Babel- 插件接入工作的部分。
- Babel提供了@babel/traverse(遍历)方法维护AST树的整体状态，方法的参数为原始AST和自定义的转换规则，返回结果为转换后的AST。
#### Generator-生成

- 代码生成步骤把最终（经过一系列转换之后）的 AST 转换成字符串形式的代码，同时还会创建源码映射（source maps）。
- 遍历整个 AST，然后构建可以表示转换后代码的字符串。
- Babel使用 @babel/generator 将修改后的 AST 转换成代码，生成过程可以对是否压缩以及是否删除注释等进行配置，并且支持 sourceMap。

## babel各个包的作用
- @babel/parser 对源码进行 parse，可以通过 plugins、sourceType 等来指定 parse 语法
- @babel/traverse 通过 visitor 函数对遍历到的 ast 进行处理，分为 enter 和 exit 两个阶段，具体操作 AST 使用 path 的 api，还可以通过 state 来在遍历过程中传递一些数据
- @babel/types 用于创建、判断 AST 节点，提供了 xxx、isXxx、assertXxx 的 api
- @babel/template 用于批量创建节点
- @babel/generator 打印 AST 成目标代码字符串，支持 comments、minified、sourceMaps 等选项。
- @babel/core 基于上面的包来完成 babel 的编译流程，可以从源码字符串、源码文件、AST 开始。