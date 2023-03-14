/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  ignoredRouteFiles: ["**/.*"],
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // serverBuildPath: "build/index.js",
  // publicPath: "/build/",
  serverDependenciesToBundle: [
    "@polymath-ai/client",
    "globby",
    "slash",
    "find-up",
    "locate-path",
    "p-locate",
  ],
  future: {
    unstable_tailwind: true,
  },
};
