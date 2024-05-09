const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin"); // Import the plugin

module.exports = {
    entry: "./src/index.js",
    output: {
        filename: "main.js",
        path: path.resolve(__dirname, "dist"),
        publicPath: '/', // Ensures assets are served correctly in relation to index.html
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./src/index.html",
        }),
        new MiniCssExtractPlugin(),
        new CopyPlugin({
            patterns: [
                { from: "src/assets", to: "assets" } // Copies all assets from src/assets to dist/assets
            ],
        }),
    ],
    devServer: {
        static: {
            directory: path.resolve(__dirname, "src"),
        },
        port: 9000,
    },
    module: {
        rules: [
            {
                test: /\.html$/,
                use: ["html-loader"],
            },
            {
                // Prevent FOUC using Mini Css Extract
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, "css-loader"],
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: "asset/resource",
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: "asset/resource",
            },
            {
                test: /\.(gltf|bin)$/, // Handle both .gltf and associated .bin files
                type: 'asset/resource',
            },            
        ],
    },
    mode: "development",
};
