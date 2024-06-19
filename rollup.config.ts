import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import { RollupOptions } from "rollup";
import { minifyTemplateLiterals } from "rollup-plugin-minify-template-literals";
import typescript from "rollup-plugin-typescript2";

const common = () => [
    typescript(),
    commonjs(),
    minifyTemplateLiterals({
        options: {
            shouldMinify: () => true
        }
    })
];

const bundle = () => [
    nodeResolve(),
    terser()
  ];

const config: RollupOptions[] = [
    {
        input: "src/gradient.ts",
        output: {
            file: "dist/gradient-picker.js",
            sourcemap: true,
            format: "esm",
            name: "GradientPicker"
        },
        plugins: [...common(), ...bundle()]
    }
];

export default config;