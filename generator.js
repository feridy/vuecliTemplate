module.exports = (api, options, rootOptions) => {
  // 复制并用 ejs 渲染 `./template` 内所有的文件
  api.render('./template')
  // 修改 `package.json` 里的字段
  api.extendPackage({
    dependencies: {
      'axios': '^0.18.0',
      'vue-router': '^3.0.3',
      "axios": "^0.18.0",
      "core-js": "^2.6.5",
      "epic-spinners": "^1.1.0",
      "leaflet": "^1.5.1",
      "qs": "^6.7.0",
      "vue-wechat-title": "^2.0.5",
      "vue-ydui": "^1.2.6",
      "weixin-js-sdk": "^1.4.0-test"
    },
    devDependencies: {
      "babel-eslint": "^10.0.1",
      "clean-webpack-plugin": "^3.0.0",
      "compression-webpack-plugin": "^2.0.0",
      "eslint": "^5.16.0",
      "eslint-plugin-vue": "^5.0.0",
      "image-webpack-loader": "^5.0.0",
      "less": "^3.9.0",
      "less-loader": "^5.0.0",
      "postcss-px2rem": "^0.3.0",
      "style-resources-loader": "^1.2.1",
      "uglifyjs-webpack-plugin": "^2.1.2",
      "vue-cli-plugin-style-resources-loader": "^0.1.3",
      "vue-template-compiler": "^2.5.21",
      "webpack-bundle-analyzer": "^3.3.2"
    },
    scripts: {
      "serve": "vue-cli-service serve",
      "build": "vue-cli-service build",
      "lint": "vue-cli-service lint"
    },
  })
}