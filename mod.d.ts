declare module "mod" {
    interface SpecifierMap {
        [specifier: string]: string;
    }
    interface Scopes {
        [url: string]: SpecifierMap;
    }
    export interface ImportMap {
        imports?: SpecifierMap;
        scopes?: Scopes;
    }
    /**
     * resolves specifier with import map.
     * ```ts
     * import { resolve } from "deno-importmap"
     *
     * const specifier = "foo/mod.ts"
     * const importMap = { imports: { "foo/": "bar/" } }
     * const resolvedSpecifier = resolve(specifier, importMap) // returns "bar/mod.ts"
     * ```
     */
    export function resolve(specifier: string, importMap: ImportMap, baseURL?: string): string;
}
