const { CleanWebpackPlugin } = require("clean-webpack-plugin");

/**
 * webpack 生产环境配置
 */
module.exports = {
  // clean-webpack-plugin引入目的是为了每次编译打包时，
  // 自动清除之前生成的output.path目录
  plugins: [new CleanWebpackPlugin()]
};
