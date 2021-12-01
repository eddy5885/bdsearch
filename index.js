const cheerio = require('cheerio')
const https = require('https')
const fs = require('fs')
const path = require('path')
const dateFormat = require("dateformat");

const options = {
    headers: {
       Host: "www.baidu.com",
       Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        // "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "zh-CN,zh;q=0.9,zh-TW;q=0.8,en;q=0.7",
        "Cache-Control": "no-cache",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.55 Safari/537.36"
    }
};

function getAllFundsIds(url) {
    return new Promise((resolve, reject) => {
        https.get(url, options,function (res) {
            var chunks = [];
            res.on('data', (chunk) => {
                chunks.push(chunk)
            });
            res.on('end', () => {
                try {
                    const html = Buffer.concat(chunks).toString()
                    const $ = cheerio.load(html);

                    const container = $("#content_left")
                    const list = container.children(".c-container")
                    const c = []
                    list.each(function(){
                        const item = $(this).find(".c-abstract").text()
                        if(item.trim()){
                            c.push(item)
                        }
                        // console.log(item)
                    })
                    resolve(c)
                } catch (e) {
                    console.log(e)
                }
            });
        })
    })
}

async function run(keyword,page = 4){
    const queryWord = encodeURI(keyword)
    let searchURL = `https://www.baidu.com/s?ie=utf-8&mod=1&isbd=1&isid=dc88ebf2000124fb&wd=${queryWord}&pn=PAGE&oq=${queryWord}&tn=baiduhome_pg&ie=utf-8&usm=2&rsv_idx=2&rsv_pq=dc88ebf2000124fb&rsv_t=df1fku9NGqUUUm6iw3eKJtVkwz0zf3LwYNAv8%2ByBFCqs3pLSrsbg9fzCYoLi3pX0h%2Bdp&bs=${queryWord}&rsv_sid=undefined&_ss=1&clist=fa6a5a98b70c1fe4%09ebf964b7baca2b79&hsug=&f4s=1&csor=0&_cr1=26024`
    let total = []

    for(let i = 0;i<=page;i++){
        const URL = searchURL.replace("PAGE",i*10+"")
        const item = await getAllFundsIds(URL)
        // console.log(item)
        total = total.concat(item)
    }
    console.log(1,total,2)

    logData(total.join(" | \r\n\r\n"))
}


function logData(str){
    const now = new Date();
    const date = dateFormat(now,'yyyy-mm-dd') //日期
    const detailDate = dateFormat(now,'yyyy-mm-dd HH:MM:ss') //时间
    const fileName =`${detailDate}.txt`
    const filePath = path.resolve(__dirname, './',fileName)
    str = `${str}, \n`
    fs.writeFileSync(filePath, str, {
        flag: 'a'
    })
}


run("姘",3)