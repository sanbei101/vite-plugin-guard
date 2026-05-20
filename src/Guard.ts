import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

import type { Plugin, ResolvedConfig } from "vite";
import { normalizePath } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));
const guardPath = normalizePath(resolve(__dirname, "./Guard.vue"));

export interface PasswordPluginOptions {
  password?: string;
  entry?: string;
}

export default function passwordPlugin(options: PasswordPluginOptions = {}): Plugin {
  const targetPassword = options.password || "123456";
  const entryFile = options.entry || "src/main.ts";

  let viteConfig: ResolvedConfig;

  return {
    name: "vite-plugin-password",

    configResolved(resolvedConfig) {
      viteConfig = resolvedConfig;
    },

    resolveId(id) {
      if (id === "virtual:password-guard") {
        return "\0" + id;
      }
      return null;
    },
    load(id) {
      if (id === "\0virtual:password-guard") {
        return `
          import { createApp } from 'vue';
          import Guard from '${guardPath}';

          if (sessionStorage.getItem('__guard_passed__') !== 'true') {
            const root = document.createElement('div');
            root.id = 'password-guard-root';
            document.documentElement.appendChild(root);

            const app = createApp(Guard, { password: '${targetPassword}' });
            app.mount('#password-guard-root');
          }
        `;
      }
      return null;
    },

    transform(code, id) {
      const targetEntryPath = normalizePath(resolve(viteConfig.root, entryFile));
      if (normalizePath(id) === targetEntryPath) {
        return {
          code: `import 'virtual:password-guard';\n${code}`,
          map: null,
        };
      }
      return null;
    },
  };
}
