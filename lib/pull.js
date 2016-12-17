let exec = require('child_process').exec
let spawn = require('child_process').spawn
let fs = require('fs')
let path = require('path')


// let log = require('./log')
let webpack = require('./webpack')
let ftpUpload = require('./ftpUpload')
let log = require('./log')
let time = require('./time')
let {cwd} = require('./config')

// 创建log文件夹
const BASE_PATH = path.resolve(process.cwd(), './log/' )
if( !fs.existsSync(BASE_PATH) ){
    fs.mkdirSync(BASE_PATH)
}

// 是否在打包中
let packing = true

// 启动一个子进程，返回子进程的信息，可以拿到pid，然后通过process.kill杀掉进程
// spawn接受的参数 命令 argvs option，不接受callback回调，以stream的形式输出，然后可以把输出打印出啦
webpack.start(`npm run pack`, ()=>{
    log.create(`日志: ${new Date().toString()} \n  系统打包`)
    global.log({
        type: "NEW_PACK",
        data: {
            time: time(new Date()),
            info: {
                user_name: "系统打包",
                user_avatar: ""
            },
        }
    })
})

webpack.on('data', data=>{
    console.log(data)
    log.append(data)
})

// 打包结束
webpack.on('end', data=>{
    console.log('打包结束', data)
    log.append('打包结束')
    log.append(data)
    // 上传文件
    ftpUpload(Done)
})

webpack.on('error', data=>{
    console.log('打包出错', data)
    log.append('打包出错')
    log.append(data)
    Done()
})

// log日志


// 重置
function Done (){
    packing = false
    global.log({
        type: "END_PACK"
    })
    pull(null)
}

let arr = []

let Queue = {
    tick(info){
        arr.push(info)
    },
    // 清空队列
    clear(){
        arr.length = 0
    },
    getInfo(){
        return arr[arr.length - 1]
    }
}

// 拉取最新代码
function pull(info, done = Done) {
    // 任务加入队列
    info && Queue.tick(info)

    if(packing || arr.length == 0) {
        return packing ? log.append('打包进行中') : log.append('打包结束')
    }

    const INFO = Queue.getInfo()
    // 清空队列
    Queue.clear()

    packing = true

    global.log({
        type: 'NEW_PACK',
        data: {
            time: time(new Date()),
            info: INFO,
        }
    })

    log.create(`日志: ${new Date().toString()} \n ${JSON.stringify(INFO, null, 4)}`)

    log.append('git拉取代码:')

    // timeout
    let timeout = setTimeout(()=>{
        log.append('git 拉取超时！！！！！')
        Done()
    }, 20000)

    let p = exec(`cd ${cwd}; git checkout . ; git checkout develop ; git pull`, (err, result)=>{
        // 清楚定时器
        clearTimout(timeout)

        // 拉取失败
        if (err) {
            log.append('git更新出错')
            log.append(err.message)
            return Done()
        }

        // git信息
        log.append(result)

        if (!result.match('Already up-to-date.') ) {
            // 检查是否需要打包
            // 打包完毕检查文件差异，如果有差异就上传代码

            if (result.match('View.jsx')) {
                log.append('webpack重启:')
                webpack.close().then(
                    msg => {
                        log.append('webpack停止')
                        log.append(msg)
                        webpack.start(`npm run pack`)
                    },
                    err => {
                        log.append('webpack停止失败')
                        log.append(err)
                    }
                ).catch(err => {
                    console.log(err)
                    log.append(err)
                })
            }

        } else {
            log.append('无更新')
            Done()
        }
    })
}

module.exports = pull
