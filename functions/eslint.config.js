import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";

// Node.js globals for flat config
const nodeGlobals = {
  require: "readonly",
  exports: "readonly",
  module: "readonly",
  __dirname: "readonly",
  __filename: "readonly",
  process: "readonly",
  console: "readonly",
  Buffer: "readonly",
  setTimeout: "readonly",
  setInterval: "readonly",
  clearTimeout: "readonly",
  clearInterval: "readonly"
};

export default [
  {
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: nodeGlobals,
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: nodeGlobals,
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      "quotes": ["error", "double"],
      "max-len": ["error", { "code": 120 }],
      "object-curly-spacing": ["error", "always"],
      "indent": ["error", 2],
    },
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: nodeGlobals,
    },
    rules: {
      "quotes": ["error", "double"],
      "max-len": ["error", { "code": 120 }],
      "object-curly-spacing": ["error", "always"],
      "indent": ["error", 2],
    },
  },
];
