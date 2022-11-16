const path = require('path')
const fse = require('fs-extra')

module.exports = {
  generate: {
    done(_builder) {
      const outDir = path.resolve(
        process.cwd(),
        'dist/vendor/@injectivelabs/token-metadata'
      )
      const sourceDir = path.resolve(
        process.cwd(),
        'node_modules/@injectivelabs/token-metadata/dist/images'
      )

      fse.removeSync(outDir)
      fse.copySync(sourceDir, outDir, { overwrite: true })
    }
  }
}
