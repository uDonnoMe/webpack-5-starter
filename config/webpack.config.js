const { merge } = require("webpack-merge");
const baseConfig = require("./webpack.base.config");
const devConfig = require("./webpack.dev.config");
const prodConfig = require("./webpack.prod.config");

/**
 *
 * @param {*} env 当前环境
 * @param {*} argv 当前命令下的一些配置
 */
module.exports = (env, argv) => {
  const config = argv.mode === "development" ? devConfig : prodConfig;

  return merge(baseConfig, config);
};
