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

# webpack基本配置

项目的**根目录**中建立webpack配置文件：`webpack.config.js`

里面用CommonJS（node的模块化规范）的语法暴露webpack配置对象：`module.exports = {...}`

# 处理css资源

我们在入口文件中引入一个css文件，然后进行打包，会报错，因为webpack本身不具备处理css的能力，需要借助loader

安装相关loader：`npm install css-loader style-loader -D`

1. 我们在入口文件main.js中直接引入css样式文件，不需要用变量接收，引入的目的只是为了打包：`import '../css/index.css'`

2. webpack.config.js中配置css资源打包相关的loader：
   * `css-loader`：把css文件中的@import和url语句索引的css文件处理成css模块并在css-loader处理的css文件中引入，并将正在处理的css文件转化成一个commonjs规范的js模块
   * `style-loader`：把css-loader生成的js语言的样式生成一个<script>标签自动添加到html页面中，相当于应用打包生成的样式（前提是html页面引入了我们webpack打包生成的文件），换句话说就是如果html页面引入了打包文件（main.js），那么自动为打包文件里的css资源创建script标签

配置注意点：loader配置对象的use属性数组中loader的调用顺序是从后往前，**先执行css-loader生成js文件，在执行style-loader将js文件通过script标签的形式自动加入html页面中**。

~~~js
{
    test: /\.css$/, //检测以.css结尾的文件，对这种文件应用以下loader
    use: [ 
        'style-loader',
        'css-loader' ,
    ]
},
~~~

打包：`npx webpack`

# 处理less资源

~~~js
// webpack.config.js
module.exports = {
    ...
    module: {
        rules: [
            {
                test: /\.less$/,
                use: [
                    "style-loader",//为css的js文件创建script标签添加到页面中
                    "css-loader",//css文件编译为commonjs模块
                    'less-loader',//将less文件编译为css文件
                ]
        	}
        ]
    }
};
~~~

