import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import { terser } from 'rollup-plugin-terser'
import typescript from 'rollup-plugin-typescript2'
import { sys } from 'typescript'
import * as fs from 'fs'
import * as path from 'path'
import { glob } from 'glob'

import { Extractor, ExtractorConfig } from '@microsoft/api-extractor'

const PROD = !!process.env.CI

console.log(`production: ${PROD}`)
const packageJsonPath = sys.resolvePath('./package.json')
const packageJson = JSON.parse(sys.readFile(packageJsonPath))

console.assert(packageJson.name, 'package.json .name must be present')
console.assert(
  packageJson.decentralandLibrary,
  'package.json .decentralandLibrary must be an object'
)
console.assert(packageJson.main, 'package.json .main must be present')
console.assert(packageJson.typings, 'package.json .typings must be present')

const configuration = {
  projectFolder: process.cwd(),
  mainEntryPointFilePath: path.resolve(
    packageJson.main.replace(/\.js$/, '.d.ts')
  ),
  compiler: {
    tsconfigFilePath: 'tsconfig.json'
  },
  dtsRollup: {
    enabled: true,
    untrimmedFilePath: packageJson.typings
  },
  tsdocMetadata: {
    enabled: true,
    tsdocMetadataFilePath: '<projectFolder>/tsdoc-metadata.json'
  },
  messages: {
    compilerMessageReporting: {
      default: {
        logLevel: 'warning'
      }
    },
    extractorMessageReporting: {
      default: {
        logLevel: 'warning'
      }
    },
    tsdocMessageReporting: {
      default: {
        logLevel: 'warning'
      }
    }
  }
}

const plugins = [
  typescript({
    verbosity: 2,
    clean: true,
    tsconfigDefaults: {
      include: ['src'],
      compilerOptions: {
        module: 'ESNext',
        sourceMap: true,
        declaration: true
      },
      extends: './node_modules/decentraland-ecs/types/tsconfig.json'
    },
    tsconfig: 'tsconfig.json',
    tsconfigOverride: {
      declaration: true,
      declarationMap: true,
      sourceMap: false,
      inlineSourceMap: true,
      inlineSources: true
    },
    typescript: require('typescript')
  }),
  resolve({
    browser: true,
    preferBuiltins: false
  }),
  commonjs({
    ignoreGlobal: true,
    include: [/node_modules/],
    namedExports: {}
  }),

  PROD && terser({}),

  {
    name: 'api-extractor',
    writeBundle() {
      return apiExtractor()
    }
  }
]

export default {
  input: './src/index.ts',
  context: 'globalThis',
  plugins,
  external: /@decentraland\//,
  output: [
    {
      file: packageJson.main,
      format: 'amd',
      name: packageJson.name,
      sourcemap: 'inline',
      amd: {
        id: packageJson.name
      }
    }
  ]
}

async function apiExtractor() {
  const prepareOptions = {
    configObject: configuration,
    configObjectFullPath: undefined,
    packageJsonFullPath: packageJsonPath
  }

  const typingsFullPath = path.resolve(packageJson.typings)

  let newentryPoint = null
  if (
    fs.existsSync(typingsFullPath) &&
    typingsFullPath == path.resolve(configuration.mainEntryPointFilePath)
  ) {
    newentryPoint = path.resolve(
      path.dirname(typingsFullPath),
      Math.random() + path.basename(typingsFullPath)
    )
    fs.copyFileSync(typingsFullPath, newentryPoint)
    fs.unlinkSync(typingsFullPath)
    configuration.mainEntryPointFilePath = newentryPoint
  }

  const extractorConfig = ExtractorConfig.prepare(prepareOptions)

  // Invoke API Extractor
  const extractorResult = Extractor.invoke(extractorConfig, {
    // Equivalent to the "--local" command-line parameter
    localBuild: !PROD,

    // Equivalent to the "--verbose" command-line parameter
    showVerboseMessages: true
  })

  glob
    .sync(path.dirname(packageJson.main) + '/**/*.d.ts', { absolute: true })
    .forEach(file => {
      if (file != typingsFullPath) {
        fs.unlinkSync(file)
      }
    })

  if (extractorResult.succeeded) {
    console.log(`API Extractor completed successfully`)
  } else {
    throw new Error(
      `API Extractor completed with ${extractorResult.errorCount} errors and ${extractorResult.warningCount} warnings`
    )
  }
}
