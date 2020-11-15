/**
 * webpack 开发环境设置
 */
module.exports = {
  // 通过cheap的模式大幅提升source map的生成效率（针对dev环境）
  devtool: 'eval-cheap-module-source-map'
}