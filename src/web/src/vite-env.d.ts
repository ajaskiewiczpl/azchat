/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL: string
    readonly VITE_APP_DEFAULT_USERNAME: string
    readonly VITE_APP_DEFAULT_PASSWORD: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}