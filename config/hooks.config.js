const path = require('path')
const fse = require('fs-extra')

module.exports = {
  generate: {
    done(_builder) {
      const outDir = path.resolve(
        __dirname,
        'dist/vendor/@injectivelabs/token-metadata'
      )
      const sourceDir = path.resolve(
        __dirname,
        'node_modules/@injectivelabs/token-metadata/dist/images'
      )

      fse.removeSync(outDir)
      fse.copySync(sourceDir, outDir, { overwrite: true })
    }
  }
}
