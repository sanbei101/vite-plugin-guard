import { createHash } from "crypto";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

import type { Plugin } from "vite";
import { normalizePath } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));
const guardPath = normalizePath(resolve(__dirname, "./Guard.vue"));

export interface PasswordPluginOptions {
  password?: string;
}

export default function passwordPlugin(options: PasswordPluginOptions = {}): Plugin {
  const rawPassword = options.password || "123456";
  const passwordHash = createHash("sha256").update(rawPassword).digest("hex");

  return {
    name: "vite-plugin-password",

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

          const root = document.createElement('div');
          root.id = 'password-guard-root';
          document.documentElement.appendChild(root);

          const app = createApp(Guard, { passwordHash: '${passwordHash}' });
          app.mount('#password-guard-root');
        `;
      }
      return null;
    },

    transformIndexHtml(html) {
      const scriptRegex = /<script\s+[^>]*type="module"[^>]*src="([^"]+)"[^>]*><\/script>/i;
      const match = html.match(scriptRegex);

      if (!match) return html;

      const originalEntry = match[1];

      const replacementScript = `
    <script type="module">
      (async () => {
        if (sessionStorage.getItem('__guard_passed__') === 'true') {
          await import('${originalEntry}');
        } else {
          await import('virtual:password-guard');
        }
      })();
    </script>
      `.trim();
      return html.replace(match[0], replacementScript);
    },
  };
}
