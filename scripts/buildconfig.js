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
        svelte(),
        resolve(),
        commonjs()
    ]
}

const esmBundleOutputConfig = { file: "dist/modalr.esm.js", format: "es" }
const umdBundleOutputConfig = { file: "dist/modalr.js", format: "umd", name: objName }

const createEsm = async () => {
    const bundle = await rollup.rollup(baseRollupConfig)
    await bundle.write(esmBundleOutputConfig)
}

const createUmdFromEsm = async () => {
    const bundle = await rollup.rollup({
        input: "dist/modalr.esm.js",
        plugins: [
            babel(),
            terser()
        ]
    })

    await bundle.write(umdBundleOutputConfig)
}

const productionBuild = async () => {
    await createEsm()

    if (prod) {
        await createUmdFromEsm()
    }
}

const developmentBuild = async () => {
  console.log('building')
  const bundle = await rollup.rollup(baseRollupConfig)
  await bundle.write(umdBundleOutputConfig)
}

module.exports = {
    productionBuild,
    developmentBuild
}


