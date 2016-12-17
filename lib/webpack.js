let {spawn, exec} = require('child_process')
let {cwd} = require('./config')

let pid = undefined

function start(command, callback) {
    callback()
    // const arr = command.split(' ')

    // let p = spawn(arr[0], arr.slice(1))

    let newCommand = `cd ${cwd}; ${command}`
    let p = exec(newCommand)

    // 获取进程id
    pid = p.pid

    p.stdout.on('data', onData);

    p.stderr.on('data', onData);

    p.on('exit', code => {
        pid = undefined
        pack.trigger('close')
        console.log('child process exited with code ' + code);
    });
}

function onData(data){
    // data = data.toString()
    pack.trigger('data', data)

    // 打包出错
    if( data.includes(`ERROR in`) ) {
        let errIndex = data.indexOf(`ERROR in`)
        let errMsg = data.slice(errIndex)
        pack.trigger('error', errMsg)
    }

    // 打包结束
    if( /Hash:[^\n]+\nVersion:[^\n]+\nTime:[^\n]+/g.test(data) ){
        pack.trigger('end', data)
    }
}


let events = {}

let pack = {
    // 打包结束
    trigger(eventName, data){
        events[eventName] = events[eventName] || []
        events[eventName].forEach(callback => callback(data))
    },
    on(eventName, callback){
        events[eventName] = events[eventName] || []
        events[eventName].push(callback)
    },
    off(eventName, callback) {
        events[eventName] = events[eventName] || []
        events[eventName] = events[eventName].filter(item => {
            if( !callback ) {
                return false
            }

            return callback !== item
        })
    },
    // 关闭webpack
    close(){
        return new Promise(res => {
            exec('make stopwebp', ()=>{
                res()
            })
        })
        // pid !== undefined && process.kill(pid)
    },
    start
}

module.exports = pack
