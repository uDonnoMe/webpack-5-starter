/**
 * Webpack 基础配置文件
 * (无论开发/生产环境都是共享的配置)
 */
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
      // 模板html：只需要写除了script引入之外的所有布局样式相关内容
      {
        template: "./index.html"
      }
    ),
    // 某些不需要webpack编译的静态文件，可以集中放在static目录下，用此插件直接copy到output目录下的相对位置（降低编译成本）
    new CopyPlugin({
      patterns: [{
        from: 'static', // 项目根目录下的相对路径
        to: 'static' // output目录下的相对路径（没有则会自动创建）
      }]
    })
  ]
};
