
let fs = require('fs')
let path = require('path')

let time = require('./time')
let {cwd} = require('./config')


function log(str){
    return `${new Date().toString()}\n${str}\n`
}

let logFile

function logFun(){
    const file_name =  path.resolve(cwd, './log/' + time(new Date()) + '.js' )

    return {
        write(msg){
            msg = `打包事件: ${new Date().toString()} \n` + msg
            global.log && global.log(msg)

            fs.writeFileSync(file_name, msg, 'utf8')
        },
        append(msg){
            // console.log(typeof str, Object.keys(str) )
            let str =  msg.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '')
            global.log && global.log(str)

            str = '\n' + str
            fs.appendFileSync(file_name, str, 'utf8')
        }
    }
}

module.exports = {
    append(...args){
        logFile.append(...args)
    },
    create(...args){
        logFile = logFun()
        logFile.write(...args)
    }
}
