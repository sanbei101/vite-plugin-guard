import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

import Guard from "./src/Guard";

export default defineConfig({
  plugins: [vue(), Guard({ password: "1234" })],
});
