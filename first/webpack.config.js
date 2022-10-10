const path = require('path')

module.exports = {
    //入口
    entry: "./src/main.js", //用相对路径，指明打包的入口文件
    //输出——与输出相关的是一个配置对象
    output: {
        //path指明文件的输出路径
        path: path.resolve(__dirname, 'dist'), //path.resolve构造绝对路径
        //文件名
        filename: 'main.js'
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
        ],
    },
    //插件
    plugins: [
        //plugin的配置
    ],
    //模式（生产or开发——压缩or不压缩）
    mode: 'development',
}

/*
    我们配置了上面这个webpack.config.js之后，其实和执行npx webpack ./src/main.js --mode=development效果是一样的
    但是我们再次执行webpack命令就可以简写为npx webpack,我们这样写系统就会默认在命令执行目录寻找webpack配置文件，然后
    按照webpack配置文件进行打包。
*/