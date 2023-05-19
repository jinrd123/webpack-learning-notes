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

