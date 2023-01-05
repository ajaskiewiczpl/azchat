import type { ConfigFile } from "@rtk-query/codegen-openapi";

const config: ConfigFile = {
    schemaFile: "http://localhost:5000/swagger/v1/swagger.json",
    apiFile: "./src/redux/baseApi.ts",
    apiImport: "baseApi",
    outputFile: "./src/redux/api.ts",
    exportName: "api",
    hooks: true,
    flattenArg: true,
};

export default config;
