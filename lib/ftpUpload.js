const fs = require('fs');
const path = require('path');
const {exec} = require('child_process')

const log = require('./log');
const {cwd} = require('./config')



// ftp上传文件
async function ftpUpload(callback = ()=>{}, TYPE = 'changeFiles'){
    // 获取差异文件
    let needUploadFiles = []
	try {
		let routerStr = fs.readFileSync(path.resolve(cwd, './router-change.cache')).toString()
		needUploadFiles = JSON.parse(routerStr)[TYPE]
	} catch (err) {
		log.append(err.msg)
	}

	if (needUploadFiles.length == 0) {
		log.append('无最新文件')
        return callback('无最新文件')
	}
	needUploadFiles = needUploadFiles.map(item => {
		return item.replace('/webApp/', '')
	})
	log.append('差异文件')
    log.append( JSON.stringify(needUploadFiles) )
	let COMMAND = `lyftp --files ${needUploadFiles.join(' ')}`

    try {
        await ftp(COMMAND)
        await ftp('lyftp router')
        callback('success')
    } catch (e) {
        log.append('上传失败')
        log.append(e)
        callback('上传成功')
    }
}

// ftp上传
function ftp(command = ''){
    return new Promise(res => {

        let p = exec(command)

        p.stdout.on('data', (msg)=>{
            log.append(msg)
        })

        p.stderr.on('data', (msg)=>{
            log.append(msg)
        })

        p.on('error', (msg)=>{
            console.log(msg)
        })

        p.on('exit', ()=>{
            console.log('上传结束')
            res('上传结束')
        })
    })
}

module.exports = ftpUpload
