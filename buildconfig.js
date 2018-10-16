const rollup = require('rollup');
const babel = require('rollup-plugin-babel');
const { terser } = require("rollup-plugin-terser");
const svelte = require("rollup-plugin-svelte");
const resolve = require("rollup-plugin-node-resolve");
const commonjs = require("rollup-plugin-commonjs");

const objName = "modalr";
const prod = !process.env.ROLLUP_WATCH;

const baseRollupConfig = {
    input: "src/modalr.js",
    plugins: [
        svelte({
            generate: 'dom',
            format: 'es',
            css: true,
            store: true,
            dev: !prod,
        }),
        resolve({ jsnext: true, main: true, browser: true }),
        commonjs()
    ]
}

const esmBundleOutputConfig = { file: "dist/modalr.esm.js", format: "es" }
const iifeBundleOutputConfig = { file: "dist/modalr.js", format: "iife", name: objName }

const buildStep1 = async () => {
    const bundle = await rollup.rollup(baseRollupConfig)
    await bundle.write(esmBundleOutputConfig)
}

const buildStep2 = async () => {
    const bundle = await rollup.rollup({
        input: "dist/modalr.esm.js",
        plugins: [
            babel(),
            terser()
        ]
    })

    await bundle.write(iifeBundleOutputConfig)
}

const build = async () => {
    await buildStep1()

    if (prod) {
        await buildStep2()
    }
}

const buildLib = async () => {
    console.log('building')
    const bundle = await rollup.rollup(baseRollupConfig)
    await bundle.write(iifeBundleOutputConfig)
}

const dev = async () => {
    await buildLib()
}

module.exports = {
    build,
    dev
}


