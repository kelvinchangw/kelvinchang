const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin"); // Import the plugin
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");
const sharp = require("sharp"); // Import sharp for resizing

module.exports = {
    entry: "./src/index.js",
    output: {
        filename: "main.js",
        path: path.resolve(__dirname, "dist"),
        publicPath: "/", // Ensures assets are served correctly in relation to index.html
        clean: true, // Cleans the dist folder before each build
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./src/index.html",
        }),
        new MiniCssExtractPlugin(),
        new CopyPlugin({
            patterns: [
                { from: "src/assets", to: "assets" }, // Copies all assets from src/assets to dist/assets
            ],
        }),
        new ImageMinimizerPlugin({
            minimizer: {
                implementation: ImageMinimizerPlugin.imageminMinify,
                options: {
                    plugins: [["pngquant", { quality: [0.6, 0.9] }]],
                },
            },
        }),
    ],
    devServer: {
        static: {
            directory: path.resolve(__dirname, "src"), // Serve files from the src directory
        },
        port: 9000,
    },
    module: {
        rules: [
            {
                test: /\.html$/, // Handle HTML files
                use: ["html-loader"],
            },
            {
                test: /\.css$/i, // Handle CSS files
                use: [MiniCssExtractPlugin.loader, "css-loader"],
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i, // Handle images
                type: "asset/resource",
                // generator: {
                //     filename: "images/[name][ext]", // Output images in dist/images/
                // },
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i, // Handle fonts
                type: "asset/resource",
            },
            {
                test: /\.(gltf|bin)$/, // Handle both .gltf and associated .bin files
                type: "asset/resource",
            },
        ],
    },
    mode: "development",
};
