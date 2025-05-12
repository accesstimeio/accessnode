/// <reference types="vite/client" />

interface ViteTypeOptions {
    // By adding this line, you can make the type of ImportMetaEnv strict
    // to disallow unknown keys.
    // strictImportMetaEnv: unknown
}

interface ImportMetaEnv {
    readonly VITE_ACCESSNODE_TYPE: "light" | "full";
    readonly VITE_ACCESSNODE_URL: string;
    // more env variables...
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}