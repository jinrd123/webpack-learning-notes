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

# 打包前自动清空上次的打包内容

目前每次打包前需要手动删除dist文件夹下的内容，希望执行`npx webpack`之前自动清空，给`output`增加配置项`output.clean`为`true`即可。

~~~js
output: {
    path: path.resolve(__dirname, 'dist'), 
    filename: 'static/js/main.js',
    //打包前自动清空上次的打包内容
    clean: true,
},
~~~

# webpack5资源模块类型(asset module type)

通过添加 4 种新的模块类型替换掉了webpack5之前的相关loader

也就是loader配置对象的type属性值：

- `asset/resource` 发送一个单独的文件并导出 URL。之前通过使用 `file-loader` 实现。
- `asset/inline` 导出一个资源的 data URI。之前通过使用 `url-loader` 实现。
- `asset/source` 导出资源的源代码。之前通过使用 `raw-loader` 实现。
- `asset` 在导出一个 data URI 和发送一个单独的文件之间自动选择。之前通过使用 `url-loader`，并且配置资源体积限制实现。

**目前不是很理解具体的意义，但大致可以知道，处理图片时type值为asset，根据图片大小决定导出一个base64（dataURL）还是一个图片，然后字体图标资源用asset/resource，可能就是想确定性的输出一个文件。所以type配置项大概的功能应该就是决定输出的类型（输出一个文件，还是确定性输出dataURL，还是根据大小决定文件或者dataURL）**

# 处理字体图标资源

我们在项目中引入字体图标，并在webpack中进行打包

字体图标的本地引入：

阿里巴巴图标库中不使用生成代码，点击下载至本地，下载下来一个文件夹，把里面的css文件（iconfont.css）和三个字体文件（iconfont.ttf/.woff/.woff2）放到项目里即引入了完整的字体图标相关文件。

我们在入口文件中引入css文件（iconfont.css），即可执行打包操作，因为我们配置了css处理相关的loader，这样css文件直接解析融合到js文件中，但是三个字体文件没有相关的loader配置。所以我们为字体文件配置loader：

~~~js
{
    test: /\.(ttf|woff2?)$/,
    //不同于asset，asset会把小文件转base64，我们字体文件不需要转
    type: "asset/resource",
    //generator.filename配置项指test配置项指定的文件经过webpack处理后输出的文件地址以及文件名
    generator: {
        //把二进制字体文件输出到media文件夹中
        filename: 'static/media/[hash:10][ext][query]',
    }
}
~~~

# 处理其他资源

比如mp3、mp4等资源，loader配置都用`type: "asset/resource"`输出一个单独的文件，可以输出到`/dist/static/media`文件夹，所以直接在上面字体资源相关的loader配置项的test属性里加相关文件类型即可（拓展）。

# 处理js资源

webpack本身的打包默认只能处理js的模块化语法，而其它一些js语法是不会处理的，比如箭头函数语法，当然这些语法(某些旧版本的)浏览器也是不识别的，所以我们需要通过webpack的`Babel`（一个webpack loader）处理js资源，进行兼容性处理。

其次开发中，团队对代码的风格、格式是严格要求的，我们使用`Eslint`（一个webpack插件）进行代码格式检测。

所以js资源的处理有两步：**先完成Eslint，检测代码格式无误之后再由Babel做代码兼容性处理**。

## Eslint配置

我们使用Eslint就是写Eslint配置文件，里面写各种rules规则，将来运行Eslint时就会以写的规则对代码进行检查。

### Eslint配置文件

配置文件有很多种写法

* `.eslintrc.*`：新建配置文件，位于项目根目录，有如下文件类型，区别在于配置格式不一样
  * `.eslintrc`
  * `.eslintrc.js`
  * `.eslintrc.json`
* 在`package.json`中配置`eslintConfig`配置项

**Eslint会查找并自动读取它们，以上配置文件只需要存在一个即可。**

下面我们选择js类型的独立配置文件（`.eslintrc.js`）对一些常见的配置规则进行学习。

`.eslintrc.js`：

~~~js
module.exports =  {
    //解析选项
    parserOptions: {},
    //具体检查规则
    reluse: {},
    //继承规则（规则集合）
    extends: [],
    //...
}
~~~

1. `parserOptions`配置选项：

~~~js
parserOptions: {
    ecmaVersion: 6, // ES 语法版本
    sourceType: "module", // ES 模块化
    ecmaFeatures: { // ES 其它特性
        jsx: true //如果是 React 项目，就需要开启 jsx 语法
    }
}
~~~

2. `rules`配置选项：

~~~js
"rules": {
    /*
    	semi和quotes为规则名称，"quotes": "error"表示应用此规则并在违反quotes规则时程序报错
    */
    "semi": ["error", "always"],
    "quotes": "error",
}
~~~

rules规则对象里的键值对就是具体的规则配置，键代表规则名称，值一般取值为`"off"`、`"warn"`、`"error"`之一

* `"off"`or`0`：不使用（关闭）规则（不使用键代表的那个规则）
* `"warn"`or`1`：使用键代表的规则，违反时出现警告（不会影响代码运行，程序不退出）
* `error`or`2`：使用键代表的规则，违反时程序报错并退出

3. `extends`配置选项：

~~~js
extends: ["react-app"],
~~~

extends指定继承的rules规则集

较为有名的规则集：

* Eslint官方规则：`"eslint:recommended"`
* Vue Cli官方规则：`"plugin:vue/essential"`
* React Cli官方规则：`"react-app"`

**rules配置项配置的规则优先级高于extends获得的规则，rules规则会对extends规则进行覆盖。**

### Eslint基本使用

webpack5中eslint功能作为一个**插件**提供

1. 安装eslint相关插件：

`npm install eslint-webpack-plugin eslint --save-dev`

2. 在`webpack.config.js`中使用插件：

~~~js
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = {
  // ...
  plugins: [new ESLintPlugin({//配置对象
  	/*
  		context配置项指定需要eslint进行语法检查的文件路径
  	*/
    context: path.resolve(__dirname, "src"),
  })],
  // ...
};
~~~

3. 执行`npx webpack`命令（前提是我们已经配置了eslint配置文件—`.eslintrc.js`）

## babel配置

### babel配置文件

babel配置文件也有多种写法：

* `babel.config.*`：新建配置文件，位于项目的根目录
  * `babel.config.js`
  * `babel.config.json`
* `.babelrc.*`：新建配置文件，位于项目的根目录
  * `.babelrc`
  * `.babelrc.js`
  * `.babelrc.json`
* `package.json`中配置`babel`配置项

**Babel会查找并自动读取它们，以上配置文件只需要存在一个即可。**

以`babel.config.js`为例：

~~~js
module.exports = {
    // 预设
    presets: [],
}
~~~

1. presets（预设）配置选项：

简单理解就是一组Babel插件，拓展Babel的功能

* `"@babel/preset-env"`：一个智能预设，功能是允许使用最新的javascript。
* `"@babel/preset-react"`：用来编译React jsx 语法的预设
* `"@babel/preset-typescript"`：用来编译TypeScript语法的预设

### babel基本使用

1. 安装babel相关的包

`npm install -D babel-loader @babel/core @babel/preset-env`

2. webpack配置文件增加loader配置项

~~~js
{
    /*
    	babel主要处理js文件的ES6语法，所以test匹配js文件
    */
    test: /\.m?js$/,
    /*
    	排除node_modules文件夹下的js文件
    */
    exclude: /node_modules/,
    /*
    	使用'babel-loader'
    */
    loader: 'babel-loader',
    /*
    	等价于babel配置文件，有babel配置文件的话，options配置项可以省略
    */
    options: {
        presets: ['@babel/preset-env']
    }
}
~~~

我们省略有关babel的loader配置项中的`options`，然后使用配置文件`babel.config.js`：

~~~js
module.exports = {
    //简单使用一个智能预设：编译ES6的语法为更古老的语法，增加兼容性
	presets: ['@babel/preset-env'],
}
~~~

配置文件效果等价于loader中配置`options`

# 处理Html资源

我们目前在`public/index.html`文件中通过手动引入的方式引入了打包生成的main.js（`<script src="../dist/static/js/main.js"></script>`）。

我们使用插件`HtmlWebpackPlugin`，作用是在dist文件夹下生成一个index.html，这个html文件内自动引入了我们打包生成的js文件。

1. 安装相关包

`npm install --save-dev html-webpack-plugin`

2. webpack配置文件中引入并使用此插件即可

~~~js
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
  ...
  /*
  	new HtmlWebpackPlugin()直接这样配置生成的index.html虽然引入了打包生成的js资源，但结构并没有保留，我们需要template属性指定生成的index.html以哪个html资源为模板
  */
  plugins: [new HtmlWebpackPlugin(
  	template: path.resolve(__dirname, "public/index.html")
  )],
};
~~~

这样打包后在dist文件夹下生成了一个自动引入了打包的js资源的html文件，且结构与template指定的html文件相同。

# 配置开发服务器&自动化打包（服务器端打包呈现效果，但不输出到dist文件夹）

因为代码修改并保存之后并不会改变我们打包后的资源，要想看到代码改变的效果，需要手动重新进行打包。我们希望每次保存代码后自动进行打包。

1. `npm i webpack-dev-server -D`
2. webpack配置文件的顶级配置对象：

~~~js
devServer: {
    host: "localhost", // 启动服务器域名
    port: "3000", // 启动服务器端口号
    open: true, //是否自动打开浏览器
},
~~~

3. 命令行执行：`npx webpack serve`

注意：**执行npx webpack serve启动起来项目之后，（浏览器中）会根据代码的保存实时更新呈现效果，但并不会在项目的dist文件夹下真正的进行打包（dist文件夹内容不变，代码更新之后在服务器端进行实时打包并呈现）**。