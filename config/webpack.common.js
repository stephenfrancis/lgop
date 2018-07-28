
const Path = require("path");
const Pkg = require("../package.json");
const Webpack = require("webpack");

module.exports = {
  entry: "./src/App.tsx",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        // exclude: /node_modules/,
        use: "ts-loader",
      },
      // {
      //   test: require.resolve("snapsvg/dist/snap.svg.js"),
      //   use: "imports-loader?this=>window,fix=>module.exports=0",
      // },
    ],
  },
  output: {
    filename: "app.min.js",
    path: Path.resolve(__dirname, "../public")
  },
  plugins: [
    new Webpack.DefinePlugin({
      AppVersion: JSON.stringify(Pkg.version),
    }),
  ],
  resolve: {
    extensions: [ ".tsx", ".ts", ".js", ".json" ],
    // alias: {
    //   snapsvg: "snapsvg/dist/snap.svg.js",
    // },
  },
};
