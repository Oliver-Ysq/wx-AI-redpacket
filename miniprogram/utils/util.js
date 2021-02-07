// tool 工具箱

/* 函数节流 */
function throttle(fn, interval) {
    let enterTime = 0; //触发的时间
    let gapTime = interval || 300; //间隔时间，如果interval不传值，默认为300ms
    return function () {
        let that = this;
        let backTime = new Date(); //第一次函数return即触发的时间
        if (backTime - enterTime > gapTime) {
            fn.call(that, arguments);
            enterTime = backTime; //赋值给第一次触发的时间 保存第二次触发时间
        }
    };
}

/* 函数防抖 */
function debounce(fn, interval) {
    let timer;
    let gapTime = interval || 1000; //间隔时间 不传值默认为1000ms
    return function () {
        clearTimeout(timer);
        let that = this;
        let args = arguments; //保存arguments setTimeout是全局的 arguments不是防抖函数需要的
        timer = setTimeout(function () {
            fn.call(that, args);
        }, gapTime);
    };
}

/* 
  防止重复点按
  相应的函数得到结果后，flag重新置为true
*/
function onetap(fn) {
    let myFlag = true;
    return function (e) {
        let that = this;
        if (myFlag === true) {
            myFlag = false;
            fn.call(that, arguments)
                .then((res) => {
                    if (res) console.log(res);
                    myFlag = true;
                })
                .catch((err) => {
                    if (err) console.log(err);
                    myFlag = true;
                });
        }
    };
}

//获取时间
function getTime() {
    let date = new Date();
    date =
        date.getFullYear() +
        "-" +
        (date.getMonth() + 1) +
        "-" +
        date.getDate() +
        " " +
        date.getHours() +
        ":" +
        date.getMinutes();
    console.log(date);
    return date;
}

//处理图片供tf训练
function getFrameSliceOptions(
    frameWidth,
    frameHeight,
    displayWidth,
    displayHeight
) {
    let result = {
        start: [0, 0, 0],
        size: [-1, -1, 3],
    };

    const ratio = displayHeight / displayWidth;

    if (ratio > frameHeight / frameWidth) {
        result.start = [
            0,
            Math.ceil((frameWidth - Math.ceil(frameHeight / ratio)) / 2),
            0,
        ];
        result.size = [-1, Math.ceil(frameHeight / ratio), 3];
    } else {
        result.start = [
            Math.ceil((frameHeight - Math.floor(ratio * frameWidth)) / 2),
            0,
            0,
        ];
        result.size = [Math.ceil(ratio * frameWidth), -1, 3];
    }

    return result;
}

//处理接受逻辑
function handleReceive(data, that, resolve, reject, type, spendTime) {
    let texts = {
        0: "红包空啦！",
        "-1": "您已领取过！",
    };
    if (data.status_code > 0) {
        that.setData({
            money: data.money,
        });
        console.log(`领取到了${formatMoney(data.money)}元`);
        console.log("消耗时间：" + spendTime);

        wx.redirectTo({
            url: "/receiveRedp/getMoney/getMoney?moneyFlag=1&money=" +
                that.data.money +
                "&question=" +
                that.data.titleText +
                "&redid=" +
                that.data.redid +
                "&nickname=" +
                that.data.nickname +
                "&sendUrl=" +
                that.data.sendUrl +
                "&activeType=" +
                type +
                "&avatarUrl=" +
                that.data.avatarUrl +
                "&spendTime=" +
                spendTime +
                "&imgUrl=" +
                that.data.imgUrl,
            complete: () => resolve("领取成功"),
        });
    } else {
        reject(texts[data.status_code]);
        wx.showToast({
            title: texts[data.status_code],
            icon: "none",
        });
    }
}

//将临时路径图片保存到本地相册
function saveImageToPhotosAlbumByWX(tmpUrl) {
    wx.saveImageToPhotosAlbum({
        filePath: tmpUrl,
        success: () => {
            console.log("保存成功");
        },
        fail: () => {
            console.log("保存失败");
        },
    });
}

// 将钱数由以分为单位 转化为===> 以元为单位
function formatMoney(money) {
    return parseFloat(parseFloat(money) / 100);
}

function setCloseCanvas(that, flag) {
    that.setData({
        closeCanvas: flag
    })
}
/*导出*/
export {
    throttle,
    debounce,
    onetap,
    getFrameSliceOptions,
    getTime,
    handleReceive,
    saveImageToPhotosAlbumByWX,
    formatMoney,
    setCloseCanvas
};