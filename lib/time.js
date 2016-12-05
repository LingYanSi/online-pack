
function timeToStr(date) {
    let y = date.getFullYear()
    let m = date.getMonth()
    let d = date.getDate()
    let H = date.getHours()
    let M = date.getMinutes()
    let S = date.getSeconds()

    // [y, m, d, H, M, S].join('-')
    return `${y}-${m}-${d}T${H}:${M}:${S}`
}

module.exports = timeToStr
