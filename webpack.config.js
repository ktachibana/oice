module.exports = {
  entry: "./src/index",
  output: {
    path: __dirname + "/assets",
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
  }
};
