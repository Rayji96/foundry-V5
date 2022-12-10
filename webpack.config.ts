// Initial script generated using webpack-cli https://github.com/webpack/webpack-cli
import * as path from "path";
import * as fs from "fs-extra";
import webpack from "webpack";
import {
  Configuration as WebpackDevServerConfiguration,
  Request,
} from "webpack-dev-server";
import CopyPlugin from "copy-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";

interface Configuration extends Omit<webpack.Configuration, "devServer"> {
  devServer?: Omit<WebpackDevServerConfiguration, "proxy"> & {
    // the types in typescript are wrong for this, so we're doing it live here.
    proxy?: {
      context: (pathname: string, _request: Request) => boolean;
      target: string;
      ws: boolean | undefined;
    };
  };
}

const buildMode =
  process.argv[3] === "production" ? "production" : "development";
const isProductionBuild = buildMode === "production";

const [outDir, foundryUri] = ((): [string, string] => {
  const configPath = path.resolve(process.cwd(), "foundryconfig.json");
  const config = fs.readJSONSync(configPath, { throws: false });
  const outDir =
    config instanceof Object
      ? path.join(
          config.dataPath,
          "Data",
          "systems",
          config.systemName ?? "vtm5e"
        )
      : path.join(__dirname, "dist/");
  const foundryUri =
    (config instanceof Object ? String(config.foundryUri) : "") ??
    "http://localhost:30000";
  return [outDir, foundryUri];
})();

const config: Configuration = {
  // ignore big assets
  performance: {
    hints: false,
  },
  mode: "production",
  entry: "./src/module/main.js",
  output: {
    clean: true,
    path: outDir,
    filename: "[name].bundle.js",
    publicPath: "/systems/vtm5e",
  },
  watch: !isProductionBuild,
  plugins: [
    // Add your plugins here
    // Learn more about plugins from https://webpack.js.org/configuration/plugins/
    new CopyPlugin({
      patterns: [{ from: "system.json" }, { from: "static/" }],
    }),
    new MiniCssExtractPlugin({ filename: "css/[name].css" }),
  ],
  devServer: {
    hot: true,
    devMiddleware: {
      writeToDisk: true,
    },
    proxy: {
      context: (pathname: string, _request: Request) => {
        return !pathname.match("^/ws");
      },
      target: foundryUri,
      ws: true,
    },
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/i,
        loader: "ts-loader",
        exclude: ["/node_modules/"],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          { loader: "css-loader" },
          { loader: "sass-loader" },
        ],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: "asset",
      },

      // Add your rules for custom modules here
      // Learn more about loaders from https://webpack.js.org/loaders/
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js", "..."],
  },
};

export default config;
