import { nodeResolve } from "@rollup/plugin-node-resolve";
export default {
  input: "./dist/src/web/index.js",
  output: {
    file: "./dist/web/everything.js",
    format: "es",
  },
  plugins: [nodeResolve()],
};
