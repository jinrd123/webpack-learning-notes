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

# 处理Sass（Scss）资源

以及处理stylus类型的样式文件，都完全同上：安装相关loader并在webpack.config.js中进行配置。

# 处理图片资源

webpack5已经将webpack4中处理图片资源的相关loader集成到webpack内部了，我们只需要进行相关配置进行图片性能优化即可。

## 配置图片资源的打包：

~~~js
{
    test: /\.(png|jpe?g|gif|webp)$/,
    type: "asset",
}
//配置此项之后就会把入口文件（包括引申出去的文件）里的图片进行打包
~~~

## 配置图片的优化：

以下配置项意思就是：

* test：指明作用对象—是针对图片

* type：配置项类型，属于asset

* parser：转化目标——转化成dataUrl，所谓dataUrl就是把资源的url转化成字符串，这个字符串在浏览器就可以解析成资源本身，而不用发请求去联系真正的url（减少请求）

  这里我们就是把图片资源转化成base64格式的字符串，转化后图片的大小会变大，但是减少了请求次数，图片变大的程度取决于图片本身的大小，图片越小，变大的也越小。

  所以这里配置项的目的就是把小于10kb的图片转化成base64字符串从而达到优化的效果。

~~~js
{
	test: /\.(png|jpe?g|gif|webp)$/,
    type: "asset",
    parser: {
        dataUrlCondition: {
            maxSize: 10 * 1024, //10kb
        }
    }
}
~~~

经过这两个loader配置项之后，对于比较大的图片，正常打包（仍然是图片）,而对于小体积图片，不会生成打包图片，而是直接生成了base64格式的字符串。

# 修改输出文件目录

目前来说，我们执行`npx webpack`之后，所有被打包处理的资源全部输出到dist文件夹下，我们希望为图片以及js文件创建单独的文件夹进行输出。

~~~js
module.exports = {
	...
    output: {
        //path指明文件的输出路径
        path: path.resolve(__dirname, 'dist'), 
        //文件名
        filename: '/js/main.js'
    },
    ...
}
~~~

* `output.path`：对于所有文件来说webpack处理后的输出位置
* `output.filename`：**入口文件**经过webpack处理后输出的文件名

如果我们配置`path: path.resolve(__dirname, 'dist/js')`，那么图片和main.js都输出到dist下的js文件夹里，我们只想让入口文件输出到js文件夹下，而不想让图片也输出到js文件夹下，所以我们配置filename项：`filename: 'js/main.js'`而path项不变，为dist。这样配置之后打包，结果为：dist下的js文件夹里存放main.js，图片资源直接存放在dist文件夹下。

实际demo实现中稍作修改：让js文件夹外层为static文件夹（增加一层static文件夹）

**然后我们增加一个loader配置对象用来匹配图片资源的打包相关信息**

webpack配置对象结构：

~~~js
module.exports = {
	...
    module: {
        rules: [
            //loader的配置对象
            {
				...
            },
        ],
    }
    ...
}
~~~

loader配置对象：

~~~js
{
    test: /\.(png|jpe?g|gif|webp)$/,
    type: "asset",
    parser: {
        dataUrlCondition: {
            maxSize: 5 * 1024, //5kb
        }
    },
    //generator.filename配置项指test配置项指定的文件经过webpack处理后输出的文件地址以及文件名
    generator: {
        filename: 'static/images/[hash:10][ext][query]',
        /*
            输出到images文件夹下
            [hash]是一个唯一值，这里处理为文件名,:10表示只取十位
            [ext]源文件的后缀名，这里不变，仍然处理为输出文件的后缀名
            [query]携带的参数，这里可有可无
        */
    }
}
~~~

**当然filename配置项指定的输出位置是以output配置项（webpack配置对象的顶层配置项）的path指定的路径为基础的（也就是说经过路径组合，图片资源最终输出位置为__dirname/dist/static/images）**。

经过这两个配置之后，重新进行打包`npx webpack`，处理结果为static文件夹下存放images和js文件夹，里面分别存放打包处理后的图片和入口文件（main.js）。