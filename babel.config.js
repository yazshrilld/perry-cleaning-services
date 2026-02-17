module.exports = {
  presets: [
    [
      "@babel/preset-env",

      {
        targets: {
          node: "18", // Set target to Node 18 to enable Node-specific features
        },
      },
    ],
    "@babel/preset-typescript",
  ],
  plugins: [
    [
      "module-resolver",
      {
        // root: ["./"],
        // extensions: [".ts", ".tsx", ".js"],
        alias: {
          "@/*": "./src/*",
          "@config": "./src/config",
          "@types": "./src/types",
          "@constants": "./src/constants",
          "@utils": "./src/utils",
          "@controllers": "./src/controllers",
          "@routers": "./src/routers",
        },
      },
    ],
  ],
};
