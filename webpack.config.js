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
    target: 'node',
    entry: {
      index: "./main/index"
    },
    output: {
      path: __dirname + "/dist",
      filename: "[name].js",
      libraryTarget: "commonjs"
    },
    externals: [
      /julius/,
      /main/
    ],
    module: {
      loaders: [
        {
          test: /\.js$/,
          loader: "babel",
          exclude: /node_modules/
        }
      ]
    },
    node: {
      __dirname: false,
      __filename: false
    },
    devtool: 'source-map'
  }
];
