# VS Code调试es6代码步骤

本项目的主要目的是通过搭建一个简单的webpack脚手架，了解项目启动需要做的一些配置。

本意是为了在vs code中通过命令行调试es6代码（node运行不了es6或更高级的语法），但发现node并不支持，所以只能舍弃命令行直接输出结果调试这个方法，而是自己去搭建一个简易的、方便测试es6语法并且能够实施保存编译的环境。

从大致步骤来看，搭建调试es6以上环境的思路如下：

1. 需要<u>babel-loader</u>把es6或更高级语法转译成es5，以便node可以支持运行

   这一条是所要实现的**本质**和基础，没有转译兼容，就无法运行es6语法的js文件

   之后所做的内容都属于锦上添花

   如果坚持要使用命令行的方式调试es6，那么通过`babel编译 -> node运行编译后js`这条路也是能走通的（但是每次一小点改动都要重复这个手动步骤，非常麻烦低效）

2. 引入<u>webpack</u>实现每次保存修改，都可以实时重新编译、看到修改后的效果

   babel虽能实现最基本的运行保障，但毕竟每次修改完js文件、保存、手动跑命令转译、编译，最后再运行转译后的文件以查看修改效果，这个过程还是极度不方便的。其实在react项目中，保存文件实时编译已经见怪不怪了，但脱开框架直接搭建这是第一次（其实不难，只是之前不了解原理）。

   react项目之所以能够实现这一特性，本质上也是完全依靠于**webpack**，所以简单搭建的话只需要webpack就足够了（况且webpack本身内置了babel，就更替我们省去了第一步操作）

3. 修改一些必要的配置（`package.json, webpack.config.js, babel.config.json`）

4. 创建index页面（`index.html`），引进转译后的js文件

   index页面的主要目的是为了查看实时运行结果（确保能够随着js的保存修改而实时变化），它的html元素我们不关注（除非js的运行结果和布局有关，否则空白页就行），一般来说只需要关注console里的输出即可。

## 全局开发环境

- **node** v15.2.0
- **n** v2.1.7 (node版本管理工具，不重要，主要是方便切换、升级node版本)
- **npm** v7.0.8
- **yarn** v1.22.10

## 调试目录结构

`projectRootDir/`【项目根目录】

- `build/`【（仅生产环境下才会生成）babel编译后的低版本的源文件目录】
- `node_modules/`【所有依赖包的安装目录】
- `static/`【无需编译转换、可直接复制的静态文件目录】
- `src/`【支持es6或更高版本的源文件目录】
  - `app.js`【源文件的入口js文件，一切代码都从这里开始运行】
- `config/`【webpack各种配置文件的总目录】
  - `webpack.config.js`【webpack入口配置：负责根据环境参数合并需要应用的配置文件】
  - `webpack.base.config.js`【webpack公共配置：即无论开发/生产环境都需要的配置】
  - `webpack.dev.config.js`【开发环境配置：rebuild加速、免代码压缩、不输出打包文件】
  - `webpack.prod.config.js`【生产环境配置：代码压缩、输出打包文件到output.path目录下】
- `index.html`【查看源文件实时编译效果的页面**模板**文件】
- `package.json`【node项目配置：依赖管理/设置启动script命令】

除了`webpack.config.js`和`package.json`，其他的都只是推荐命名，如要修改，对应配置中的路径也跟着修改即可。

## package.json配置

### 1. Dependency安装

第一步首先是安装好所有必备的插件，也就是需要管理所有的依赖包。

可以手动建一个`package.json`文件，也可以直接在想要建立项目的项目根目录中运行`npm init -y`即可自动生成一个配置文件【推荐】

其中需要安装的dependency有：【注意使用-D或者--save-dev安装，因为babel和webpack的主要应用都是在<u>开发调试阶段</u>】

- webpack基础配置：【必要】
  - webpack
  - webpack-dev-server
  - webpack-cli

- webpack增强插件：【可选】

  - html-webpack-plugin： 自动把所有编译后的js脚本引入html，可配html布局模板

    不用插件手动引入js也可以，但存在缺点：比较麻烦、死板，且存在依赖关系时引入顺序要求严格

  - copy-webpack-plugin：设置static静态文件目录，可免去静态文件的编译转换（节省性能），直接复制到编译后的指定目录

  - webpack-merge：根据环境参数（开发/生产）选配、合并webpack配置文件时需要

  - clean-webpack-plugin：开发环境webpack配置需要，每次打包前会自动清除之前output.path目录留下的打包文件

- babel相关：【转换es5必须】

  - @babel-core
  - @babel/preset-env
  - babel-loader

**请勿使用global install**（`npm install -g`），容易造成其他项目中同名依赖的版本冲突！

另外，推荐使用`yarn add <dependency> -D`命令代替npm安装，多线程下载速度更快更高效。

我自己实际使用的依赖相关配置：

```json
"devDependencies": {
  "@babel/core": "^7.12.3",
  "@babel/preset-env": "^7.12.1",
  "babel-loader": "^8.2.1",
  "clean-webpack-plugin": "^3.0.0",
  "copy-webpack-plugin": "^6.3.1",
  "html-webpack-plugin": "^4.5.0",
  "webpack": "^5.4.0",
  "webpack-cli": "^4.2.0",
  "webpack-dev-server": "^3.11.0",
  "webpack-merge": "^5.4.0"
}
```

### 2. 启动script设置

```JSON
"scripts": {
  // build: 生产环境打包命令
  "build": "webpack --mode=production --config=./config/webpack.config.js",
  // start：开发环境启动命令
  "start": "webpack serve --mode=development --config=./config/webpack.config.js"
}
```

## webpack.config.js配置

该配置文件的目的是设置webpack的输入/输出位置、设置需要加载的plug-in/module等等。

对于极小规模的项目来说，单配置文件完全就足够开发使用了，不过这里根据教程，分成了开发环境/生产环境各自专属的webpack配置文件，同时还单独配了一个无论何种环境下都需要的共享配置（webpack.base.config.js）。最终，根据启动时给的环境的参数，webpack会选择针对开发/生产环境的配置进行加载。

一般来说，源文件全部放入`src/`目录下，编译后的源文件放入`build/`目录。在这个简单搭建的框架中，我把所有的webpack配置文件都放入了`config/`目录下。（由于修改了config文件的默认读取位置，所以同时需要在`package.json`的启动命令中提供匹配的config文件路径）

在这个配置中，由于我们在这里有关于文件路径的操作，所以首先要引入`path`模块（自带模块，无需另外安装任何依赖）。

以下是一个webpack 5适用的webpack config文件示例【共享配置】：

```js
// webpack.base.config.js:
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: "./src/app.js",
  output: {
    path: path.resolve(__dirname, "../build"),
    filename: "app.bundle.js"
  },
  plugins: [
    // 在编译时生成html文件，自动引入output路径下编译好的js文件
    new HtmlWebpackPlugin(
      // 模板html的相对路径
      // 模板html：只需要写除了script引入之外的内容（布局样式等）
      {
        template: "./index.html"
      }
    ),
    // 不需要webpack编译的静态文件可集中放在static目录下，用此插件直接copy到output目录下的相对位置（降低编译成本）
    new CopyPlugin({
      patterns: [{
        from: 'static', // 项目根目录下的相对路径
        to: 'static' // output目录下的相对路径（没有则会自动创建）
      }]
    })
  ],
  module: {
    rules: [
      {
        test: /\.js$/, // exactly matches files w/ .js extension
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env', {
                  useBuiltIns: "entry"
                }
              ]
            ]
          }
        }
      }
    ]
  }
};
```

- **line 8：**关于`path.resolve()`的使用：参考[nodejs官方文档](https://nodejs.org/docs/latest/api/path.html#path_path_resolve_paths)，简单来说就是从左到右合并多个参数，实现把相对路径拼接成为一个完整的绝对路径的功能。

  这里第二个参数`../build`需要回到上一级目录是因为`__dirname`获取到的是当前config文件所在的目录，在这个case中它并不是项目的根目录，而是`projectRootDir/config`，所以需要回到上一层目录，然后再建一个output目录。即期望生成的output.path = `projectRootDir/build`/。

**如果是只需单个webpack config文件的小项目：**

如果是专注于调试非常小规模的项目，那么没有必要专门建一个`config/`目录存放各种拆分后的webpack配置文件，也没有必要安装`webpack-merge`插件，可以直接把config放在根目录下，并且配上开发环境的专用配置：

```js
devtool: 'eval-cheap-module-source-map'
```

即可在dev环境下以cheap模式大幅提升source map的生成效率。

（相关配置说明请参考[webpack配置-devtool](https://webpack.js.org/configuration/devtool/#root)）

## 引入index.html

对于相对复杂的项目配置，一般而言尽管刚才已经安装、引入了`html-webpack-plugin`专用于动态引入编译好的js文件，但如果要自由布置页面布局样式的话（而非简单的空白页），那么仍然还是需要去手动创建一个`index.html`的（也可以命名成`template.html`等等），在这个手动配置的模板html中，不需要写任何script的引入，只需要写一些布局、样式上的配置即可。

这个部分，依旧分为**复杂**项目和**简单**项目两种场景来说：

- 对于**复杂**项目，`html-webpack-plugin`基本是必备的（不可能一条条手动引入js），除此之外还需要创建一个模板html（如上述）去做样式上的一些配置，然后在`webpack`配置文件的对应插件配置处引入模板html的路径即可。webpack编译时会自动引入编译好的js文件。
- 对于**简单**项目，可以免去插件的安装，直接使用手动配置的`index.html`进行js引入，引入方式如下：

	```html
	<!DOCTYPE html>
	<html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>My App</title>
    </head>
    <body>
      <!-- 引入转译后的可兼容js源文件 -->
      <script src="./build/app.bundle.js"></script> 
  </body>
	</html>
	```
	
	完成这一步，我们就可以通过浏览器打开`index.html`页面的console，查看调试结果。

**Q：为什么开发环境下（`npm start`）启动后，在output.path下找不到相应的编译后的输出文件？为什么生产环境下（`npm run build`）打包后才会在output.path生成真正的输出文件？那开发环境下，`index.html`引入的js文件的真正路径对应是哪里？**【灵魂三连】

**A：**开发环境下默认不会往output.path输出文件（或者说输出在浏览器source内的临时目录下，仅会在项目启动后运行期间才能通过浏览器访问到），只有在生产环境运行打包命令时，才会在output.path输出永久的打包文件。如果是上述简单项目手动引入js脚本的情况，就比较容易会遇到因为`src`路径写不对，导致读取不到打包后的js文件的问题。（我自己的方式就是尝试了好几种写法才碰巧对了。。像是`build/app.bundle.js`就读取不到会报错）

# Reference

- [【Youtube】Babel配置｜Webpack构建环境｜从ES6到ES11全版本js语法详解](https://www.youtube.com/watch?v=HU-BgMaoWFg)【基于webpack4，主要参考11.2～11.4章节】

- [【npm官网】babel-loader配置](https://www.npmjs.com/package/babel-loader)

- [Babel中文官方文档](https://www.babeljs.cn/docs/)

- [【Webpack官方doc】](https://webpack.js.org/concepts/)【搭建当时使用的最新版本是webpack 5】