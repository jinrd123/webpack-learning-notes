# Webpack作用

前端开发时，我们用的框架（React、Vue），以及ES6模块化语法，Less、Sass等css预处理器语法，浏览器都是不识别的，我们想要在浏览器正常运行就需要把这些代码编译成浏览器识别的JS、Css等语法。之所以我们的vue项目可以正常运行，其实是vue脚手架已经集成了webpack，所以我们不需要额外配置webpack。**Webpack打包工具除了可以完成代码编译，还可以压缩代码、做兼容处理、提升代码性能等。**

# webpack五大核心概念

* entry（入口文件）
  * 指示webpack从哪个文件开始打包
* output（输出）
  * 指示webpack打包完的文件输出到哪里去，如何命名等
* loader（加载器）
  * webpack本身只能处理js、json等资源，其它资源需要借助loader，Webpack才能解析
* plugins（插件）
  * 拓展webpack的功能
* mode（模式）
  * 开发模式：development
  * 生产模式：production