import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  // ビルド成果物と自動生成ファイルは検査しない
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
