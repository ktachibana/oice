module.exports = {
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
};
