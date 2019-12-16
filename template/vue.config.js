const postcssPx2Rem = require('postcss-px2rem');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const CompressionWebpackPlugin = require('compression-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const path = require('path');
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production';
// externals里的模块不打包 配置cdn
const externals = {
  leaflet: 'L',
};
const cdn = {
  dev: {
    css: [
      'https://cdn.bootcss.com/leaflet/1.5.1/leaflet.css',
    ],
    js: [
      'https://cdn.bootcss.com/leaflet/1.5.1/leaflet.js',
    ],
  },
  build: {
    css: [
      'https://cdn.bootcss.com/leaflet/1.5.1/leaflet.css',
    ],
    js: [
      'https://cdn.bootcss.com/leaflet/1.5.1/leaflet.js',
    ],
  },
};

module.exports = {
  lintOnSave: true,

  css: {
    loaderOptions: {
      postcss: {
        plugins: [
          postcssPx2Rem({
            remUnit: 100,
          }),
        ],
      },
      less: {

      },
    },
  },

  chainWebpack: (config) => {
    config.resolve.alias
      .set('assets', '@/assets')
      .set('components', '@/components')
      .set('views', '@/views')
      .set('css', '@/css')
      .set('api', '@/axois/api')
      .set('store', '@/store');
    // 对vue-cli内部的 webpack 配置进行更细粒度的修改。
    // 添加CDN参数到htmlWebpackPlugin配置中， 详见public/index.html 修改
    config.plugin('html').tap((args) => {
      if (process.env.NODE_ENV === 'production') {
        args[0].cdn = cdn.build;
      }
      if (process.env.NODE_ENV === 'development') {
        args[0].cdn = cdn.dev;
      }
      return args;
    });
    // 开启图片压缩
    config.module
      .rule('image-webpack-loader')
      .test(/\.(gif|png|jpe?g|svg)$/i)
      .use('file-loader')
      .loader('image-webpack-loader')
      .tap(() => ({
        disable: process.env.NODE_ENV !== 'production',
      }))
      .end();
  },

  publicPath: process.env.BASE_URL,

  configureWebpack: (config) => {
    if (isProduction) {
      // externals里的模块不打包 配置cdn
      // externals里的模块不打包
      Object.assign(config, {
        externals,
      });
      // 为生产环境修改配置...
      // 上线压缩去除console等信息
      config.optimization.minimizer[0].options.terserOptions.compress.warnings = false;
      config.optimization.minimizer[0].options.terserOptions.compress.drop_console = true;
      config.optimization.minimizer[0].options.terserOptions.compress.drop_debugger = true;
      config.optimization.minimizer[0].options.terserOptions.compress.pure_funcs = ['console.log'];
      // 分析工具
      config.plugins.push(
        new BundleAnalyzerPlugin({
          //  可以是`server`，`static`或`disabled`。
          //  在`server`模式下，分析器将启动HTTP服务器来显示软件包报告。
          //  在“静态”模式下，会生成带有报告的单个HTML文件。
          //  在`disabled`模式下，你可以使用这个插件来将`generateStatsFile`设置为`true`来生成Webpack Stats JSON文件。
          analyzerMode: 'server',
          //  将在“服务器”模式下使用的主机启动HTTP服务器。
          analyzerHost: '127.0.0.1',
          //  将在“服务器”模式下使用的端口启动HTTP服务器。
          analyzerPort: 8888,
          //  路径捆绑，将在`static`模式下生成的报告文件。
          //  相对于捆绑输出目录。
          reportFilename: 'report.html',
          //  模块大小默认显示在报告中。
          //  应该是`stat`，`parsed`或者`gzip`中的一个。
          //  有关更多信息，请参见“定义”一节。
          defaultSizes: 'parsed',
          //  在默认浏览器中自动打开报告
          openAnalyzer: true,
          //  如果为true，则Webpack Stats JSON文件将在bundle输出目录中生成
          generateStatsFile: false,
          //  如果`generateStatsFile`为`true`，将会生成Webpack Stats JSON文件的名字。
          //  相对于捆绑输出目录。
          statsFilename: 'stats.json',
          //  stats.toJson（）方法的选项。
          //  例如，您可以使用`source：false`选项排除统计文件中模块的来源。
          //  在这里查看更多选项：https：  //github.com/webpack/webpack/blob/webpack-1/lib/Stats.js#L21
          statsOptions: null,
          logLevel: 'info', // 日志级别。可以是'信息'，'警告'，'错误'或'沉默'。
        }),
      );
      // 在构建之前移除dist目录
      config.plugins.push(new CleanWebpackPlugin());
      // 开启gzip压缩
      const productionGzipExtensions = /\.(js|css|json|txt|html|ico|svg)(\?.*)?$/i;
      config.plugins.push(
        new CompressionWebpackPlugin({
          filename: '[path].gz[query]',
          algorithm: 'gzip',
          test: productionGzipExtensions,
          threshold: 10240,
          minRatio: 0.8,
        }),
      );
      // if (process.env.npm_config_report) {
      //     // 打包后模块大小分析//npm run build --report
      //     config.plugins.push(new BundleAnalyzerPlugin())
      // }
    } else {
      // 为开发环境修改配置...
      // externals里的模块不打包
      Object.assign(config, {
        externals,
      });
    }
  },

  pluginOptions: {
    'style-resources-loader': {
      preProcessor: 'less',
      patterns: [
        path.resolve(__dirname, 'src/css/mixins.less'),
        path.resolve(__dirname, 'src/css/veriable.less'),
      ],
    },
  },
  productionSourceMap: false,
};
