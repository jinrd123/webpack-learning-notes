const path = require('path')
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = {
    //入口
    entry: "./src/main.js", //用相对路径，指明打包的入口文件
    //输出——与输出相关的是一个配置对象
    output: {
        //path指明文件的输出路径
        path: path.resolve(__dirname, 'dist'), //path.resolve构造绝对路径
        //文件名
        filename: 'static/js/main.js',
        clean: true,
    },
    //加载器
    module: {
        rules: [
            //loader的配置
            {
                test: /\.css$/, //检测以.css结尾的文件，对这种文件应用以下loader
                //ues配置项中loader的执行顺序：从后往前，即先执行css-loader
                use: [ 
                    'style-loader',
                    'css-loader' ,
                    /*
                        css-loader:把css文件中的@import和url语句索引的css文件处理成css模块并在css-loader处理的css文件中引入，并将正在处理的css文件转化成一个commonjs规范的js模块
                        style-loader:把css-loader生成的js语言的样式生成一个<script>标签自动添加到html页面中（前提是html页面引入了我们webpack打包生成的文件）
                    */
                ]
            },
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
                        [hash]是一个唯一值，这里处理为文件名
                        [ext]源文件的后缀名，这里不变，仍然处理为输出文件的后缀名
                        [query]携带的参数，这里可有可无
                        当然filename配置项指定的输出位置是以output配置项的path指定的路径为基础的（也就是说经过路径组合，图片资源最终输出位置为__dirname/dist/static/images）
                    */
                }
            },
            //字体文件相关的loader配置
            {
                test: /\.(ttf|woff2?)$/,
                //不同于asset，asset会把小文件转base64，我们字体文件不需要转
                type: "asset/resource",
                //generator.filename配置项指test配置项指定的文件经过webpack处理后输出的文件地址以及文件名
                generator: {
                    filename: 'static/media/[hash:10][ext][query]',
                }
            }
        ],
    },
    //插件
    plugins: [
        //plugin的配置
        new ESLintPlugin({//配置对象
            /*
                context配置项指定需要eslint进行语法检查的文件路径
            */
          context: path.resolve(__dirname, "src"),
        })
    ],
    //模式（生产or开发——压缩or不压缩）
    mode: 'development',
}

/*
    我们配置了上面这个webpack.config.js之后，其实和执行npx webpack ./src/main.js --mode=development效果是一样的
    但是我们再次执行webpack命令就可以简写为npx webpack,我们这样写系统就会默认在命令执行目录寻找webpack配置文件，然后
    按照webpack配置文件进行打包。
*/