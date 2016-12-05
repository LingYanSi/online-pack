let http = require('http')
let fs = require('fs')
let path = require('path')
let ip = require('ip')
let ftpUpload = require('./lib/ftpUpload')
let {cwd, port} = require('./lib/config')
let pull

// 更改cwd到指定文件夹
process.chdir(cwd);

let server = http.Server((req, res) => {
    if (req.url == '/text' && req.method.toLowerCase() == 'post') {
        // 去更新
        //
        let data = []
        req.on('data', (chunck) => {
            data.push(chunck)
        })

        req.on('end', (chunck) => {
            const str = Buffer.concat(data).toString()
            try {
                const obj = JSON.parse(str)
                console.log(obj)
                pull(obj)
            } catch (err) {
                console.log(err, err.message, str);
            }

            res.status = 200
            res.end('')
        })
        // console.log()
    } else if(req.url == '/socket.io.js') {
        res.status = 200

        const PATH = path.resolve(__dirname, './static/socket.io.js')
        const html = fs.readFileSync(PATH).toString()

        res.end(html)
    } else if(req.url == '/ftp/upload') {
        res.status = 200

        ftpUpload((result)=>{
            res.end(result)
        }, 'newFiles')

    } else if (req.url.startsWith('/log/')) {
        res.status = 200

        const PATH = path.resolve(cwd, `.${req.url}`)
        try {
            const html = fs.readFileSync(PATH).toString()
            res.end(html)
        } catch(err) {
            res.end('log文件不存在')
        }
    } else {
        res.status = 200

        const PATH = path.resolve(__dirname, './static/index.html')
        const html = fs.readFileSync(PATH).toString()

        res.end(html)
    }
})

// var socket = require('http').createServer();
let clients = []

global.log = (msg) => {
    clients.forEach(client => handleSocketMsg(client, msg))
    // 每次开始的时候，把文件写入json

    msg.type == 'NEW_PACK' && apeendTickInfo(msg)
}

function handleSocketMsg(client, msg){
    const TYPE = msg.type

    switch (TYPE) {
        case 'NEW_PACK' : {
            client.emit(TYPE, JSON.stringify(msg.data)  )
            break
        }
        default :
            client.emit('event', msg )
    }
}
// 把触发打包的信息保存起来
function apeendTickInfo(msg) {
    let PATH = path.resolve(cwd, './log/info.json')
    let dataArr = []
    try{
        let str = fs.readFileSync(PATH).toString()
        dataArr = JSON.parse(str)
    } catch(err) {
        dataArr = []
    }

    dataArr.unshift(msg.data)
    fs.writeFileSync(PATH, JSON.stringify(dataArr, null, 2) )

    return dataArr
}

var io = require('socket.io')(server);
io.on('connection', function(client) {
    clients.push(client)

    // currentPack && handleSocketMsg(client, currentPack)

    client.on('event', function(data) {
        console.log(data)
    });

    client.on('disconnect', function() {
        clients = clients.filter(item => item != client)
        console.log('链接断开')
    });
});

// socket.listen(10242);

const PORT = port
server.listen(PORT, () => {
    console.log('服务已开启', `http://${ip.address()}:${PORT}`);
    pull = require('./lib/pull')
})
