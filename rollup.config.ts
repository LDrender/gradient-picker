import { RollupOptions } from "rollup";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import minifyTemplateLiterals from "rollup-plugin-minify-template-literals";

const common = () => [
    typescript(),
    commonjs(),
    minifyTemplateLiterals({
        options: {
            shouldMinify: () => true
        }
    })
];

const config: RollupOptions[] = [
    {
        input: "src/gradient.ts",
        output: {
            file: "dist/gradient-picker.js",
            format: "esm",
            name: "GradientPicker"
        },
        plugins: common()
    }
];

export default config;