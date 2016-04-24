module.exports = [
  {
    entry: __dirname + "/ui/js/index",
    output: {
      path: __dirname + "/ui/assets",
      filename: "bundle.js"
    },
    module: {
      loaders: [
        {
          test: /.js$/,
          loader: "babel",
          exclude: /node_modules/
        }
      ]
    },
    devtool: 'source-map'
  },
  {
    entry: {
      index: __dirname + "/main/index",
      preload: __dirname + "/main/preload"
    },
    output: {
      path: __dirname + "/dist",
      filename: "[name].js",
      libraryTarget: "commonjs"
    },
    externals: [
      /julius/
    ],
    module: {
      loaders: [
        {
          test: /.js$/,
          loader: "babel",
          exclude: /node_modules/
        }
      ]
    },
    target: 'electron-main',
    node: {
      __dirname: false,
      __filename: false
    },
    devtool: 'source-map'
  }
];
