# 同步loader

~~~js
// 针对某种类型的文件只有这一个loader去处理时，直接return出去处理后的文件内容即可
module.exports = function(content) {
  return content
}

// 对于配合其它loader的loader，一般使用this.callback代替return，旨在传递更多的信息给下一个loader
module.exports = function(content, map, meta) {
  /*
  	this.callback
  		第一个参数：err代表是否有错误
  		第二个参数：content代表处理后的内容，等价于return的内容
  		第三个参数：传递source-map
  		第四个参数：mata，即给下一个loader传递的参数
  */
  this.callback(null, content, map, meta);
}
~~~



# 异步loader

同步loader中不能调用异步操作（总之就是会出问题），如果想保证各个loader之间执行顺序的正常，就需要用异步loader，说白了就是webpack对于异步操作的一种语法要求

~~~js
// 异步loader
module.exports = function(content, map, meta) {
  const callback = this.async();
  
  setTimeout(() => {
    console.log("第一个loader->异步loader");
    callback(null, content, map, meta); // 意思就是在某个异步操作完成后再通过调用callback方法来触发下一个loader的执行
  }, 1000)
}

// 同步loader
module.exports = function(content, map, meta) {
	this.callback(null, content, map, meta);
}
~~~



# raw loader

一个loader（loader函数）上如果`raw`属性为`true`，那么他接收到的`content`即为二进制数据。

~~~js
module.exports = function (content) {
  console.log(content); //输出上一个loader返回数据的二进制格式
  return content;
}

module.exports.raw = true;
~~~



# pitch loaer

给`loader`函数上添加`pitch`属性，是一个方法，那么loader的执行顺序即为从左向右执行各loader的pitch方法，然后再从右向左执行loader方法（normal loader），如果`pitch`方法`return`，那么会触发熔断，也就是`pitch`方法执行完之后直接从此`loader`开始从右向左执行其它loader的normal方法（不包括pitch loader的normal）

~~~js
module.exports = {
  //...
  module: {
    rules: [
      {
        //...
        use: ['a-loader', 'b-loader', 'c-loader'],
      },
    ],
  },
};
~~~

将会发生这些步骤：

```diff
|- a-loader `pitch`
  |- b-loader `pitch`
    |- c-loader `pitch`
      |- requested module is picked up as a dependency
    |- c-loader normal execution
  |- b-loader normal execution
|- a-loader normal execution
```

如果 `b-loader` 的 `pitch` 方法返回了一些东西：

上面的步骤将被缩短为：

```diff
|- a-loader `pitch`
  |- b-loader `pitch` returns a module
|- a-loader normal execution
```

当然pitch loader还有传参以及`require`[递归解析](https://juejin.cn/post/7058652098174386213)的一些特点，就不细说了。



# loader API

![image-20230519151303721](image/loaderAPI.png)



# style-loader

[源码解析](https://github.com/jinrd123/style-loader-demo)

~~~js
module.exports.pitch = function(remainingRequest) {
  const relativePath = remainingRequest
  .split("!")
  .map((absolutePath) => {
    return this.utils.contextify(this.context, absolutePath);
  })
  .join("!");
  
  const script = `
  	import style from "!!${relativePath}";
  	const styleEl = document.createElement("style");
  	styleEl.innerHTML = style;
  	document.head.appendChild(styleEl);
  `;
  
  return script;
}
~~~



# plugins

说白了就是在webpack打包的各个生命周期中添加回调函数，从而增加webpack打包的逻辑，增强功能

~~~js
/*
	1.webpack加载webpack.config.js中的所有配置，此时就会执行new xxxPlugin()，执行插件的constructor
	2.webpack创建compiler对象，一个本次打包的唯一对象，上面记录了本次打包的所有信息，什么loader等等
	3.遍历所有plugins中的插件实例，执行他们的apply方法
		插件正是通过在apply方法中给webpack暴露出来的生命周期添加事件回调来发挥作用的
	4.执行编译流程
*/

class TestPlugin {
  construtor() {
    console.log("webpack打包之前，读取webpack配置时就会输出");
  }
  apply(compiler) {
    console.log("从此方法中给各个生命周期添加回调");
    // 查文档即可，各个hook该如何注册，hook名是什么、回调的参数是什么、回调是异步的还是同步的（并行的还是串行的）
    // compiler.hooks.someHook.tap(<plugin名>, <回调函数>);
    
    // 由文档可知，environment 是同步钩子，所以需要用tap注册(tap对应同步)，文档里这个钩子也没有参数，所以回调函数也没有参数（全查文档就完了）
    compiler.hooks.environment.tap("TestPlugin", () => {
      console.log("environment钩子被触发");
    })
  }
}

module.exports = TestPlugin;
~~~

