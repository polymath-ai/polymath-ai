/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  ignoredRouteFiles: ["**/.*"],
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // serverBuildPath: "build/index.js",
  // publicPath: "/build/",
  serverDependenciesToBundle: [
    "@polymath-ai/client",
    "@polymath-ai/validation",
    "globby",
    "slash",
    "find-up",
    "locate-path",
    "p-locate",
    "path-exists",
  ],
  future: {
    unstable_tailwind: true,
    v2_routeConvention: true,
  },
};
