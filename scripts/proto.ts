import * as path from 'path'
const { execSync } = require('child_process')
const { readdirSync } = require('fs')
const { join } = require('path')

function generateProtoFiles(protoPathRoot, outputPath, templatePath) {
  try {
    const protoPaths = readdirSync(protoPathRoot)
    const output = path.resolve(__dirname, outputPath)
    if (!protoPaths.length) {
      console.error('No .proto files found in the input path.')
      return
    }
    protoPaths.forEach((protoPath) => {
      const cmd = `tsproto --path ../../proto/${protoPath} --output ${output} --template ${templatePath}`
      try {
        execSync(cmd, { stdio: 'inherit' })
        console.log(`Generated TypeScript file from ${protoPath} to ${output}`)
      } catch (error) {
        console.error(
          `Error generating TypeScript file from ${protoPath}:`,
          error.message,
        )
      }
    })
  } catch (error) {
    console.error('Error reading input directory:', error.message)
  }
}
const type = process.argv[2]

const inputPath = '../../proto'
const outputFilePath = '../src/types/grpc/proto'
const templatePath =
  type === 'cilent'
    ? `../../packages/march-core/grpc-client/templates/nestjs-grpc-client.hbs`
    : `../../packages/march-core/grpc-client/templates/nestjs-grpc-server.hbs`

generateProtoFiles(inputPath, outputFilePath, templatePath)
