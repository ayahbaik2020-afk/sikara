import nextConfig from "eslint-config-next";

const eslintConfig = [
  { ignores: [".next/**", "node_modules/**", "src/generated/**", "next-env.d.ts"] },
  ...nextConfig,
];

export default eslintConfig;
