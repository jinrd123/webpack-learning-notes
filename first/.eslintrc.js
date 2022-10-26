module.exports =  {
    //解析选项
    parserOptions: {
        ecmaVersion: 6, // ES 语法版本
        sourceType: "module", // ES 模块化
    },
    //具体检查规则
    rules: {
        "no-undef": "off",//防止使用console.log时报错：使用未定义的变量
    },
    //继承规则（规则集合）
    extends: ["eslint:recommended"],
    //...
}