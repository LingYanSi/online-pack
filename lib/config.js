let fs = require('fs')
let path = require('path')
let PATH = path.resolve(__dirname, './../.lywptrc')
let str = fs.readFileSync(PATH).toString()
let config = JSON.parse(str)

module.exports = config
