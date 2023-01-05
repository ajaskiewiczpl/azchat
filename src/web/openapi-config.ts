import type { ConfigFile } from "@rtk-query/codegen-openapi";

const config: ConfigFile = {
    schemaFile: "http://localhost:5000/swagger/v1/swagger.json",
    apiFile: "./src/redux/baseApi.ts",
    apiImport: "azchatApi",
    outputFile: "./src/redux/azchatApi.ts",
    exportName: "azchatApi",
    hooks: true,
    flattenArg: true,
};

export default config;
