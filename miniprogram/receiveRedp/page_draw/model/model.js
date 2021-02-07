const tf = require("@tensorflow/tfjs-core");
const tfl = require("@tensorflow/tfjs-layers");
import { setCloseCanvas } from "../../../utils/util";
const LOCAL_STORAGE_KEY = "canvas_model";
const app = getApp();
const MAX_PREDICT_LENGTH = 3;

export function loadModel() {
    return new Promise((resolve, reject) => {
        // 缓存Handler
        const localStorageHandler = getApp().globalData.localStorageIO(
            LOCAL_STORAGE_KEY
        );
        tfl.loadLayersModel(localStorageHandler)
            .then((model) => {
                console.log("canvas 命中缓存");
                app.globalData.canvasModel = model;
                app.globalData.canvasModel.predict(tf.zeros([1, 128, 128, 1]));
                try {
                    wx.hideLoading();
                    setCloseCanvas(false);
                } catch (err) {}
                resolve();
            })
            .catch((err) => {
                console.log("canvas Miss缓存");
                tfl.loadLayersModel(
                    "https://weixinredpacket-1258344707.file.myqcloud.com/mobilenet/3/model.json"
                )
                    .then((model) => {
                        app.globalData.canvasModel = model;
                        app.globalData.canvasModel.save(localStorageHandler);
                        app.globalData.canvasModel.predict(
                            tf.zeros([1, 128, 128, 1])
                        );
                        try {
                            wx.hideLoading();
                            setCloseCanvas(false);
                        } catch (err) {}
                        resolve();
                    })
                    .catch((err) => reject(err));
            });
    });
}

//获取标签列表
export function getLabels() {
    return new Promise((resolve, reject) => {
        wx.request({
            url:
                "https://weixinredpacket-1258344707.file.myqcloud.com/mobilenet/1/label_list_zh.txt",
            success: (res) => resolve(res.data.split(/\n/)),
            fail: (err) => reject(err),
        });
    });
}

//处理模型
export function preprocess(that, imgData) {
    const PIC_INFO = that.data.picInfo;
    let imgDataArray = Array.from(imgData.data);
    let format = {
        data: new Uint8Array(imgDataArray),
        width: parseInt(imgData.width),
        height: parseInt(imgData.height),
    };
    return tf.tidy(() => {
        let firstTime = new Date().valueOf();
        let tensor = tf.browser.fromPixels(format, 1);
        const resized = tf.image.resizeBilinear(tensor, [128, 128]).toFloat();
        const offset = tf.scalar(127.5);
        const normalized = tf.scalar(1.0).sub(resized.div(offset));
        const batched = normalized.expandDims(0);
        let secondTime = new Date().valueOf();
        console.log("preprocess [" + (secondTime - firstTime) + "]ms");
        return batched;
    });
}

export function judgeByModels(PIC, that) {
    return new Promise((resolve, reject) => {
        let len = Math.max(PIC.width, PIC.height);
        wx.canvasToTempFilePath(
            {
                canvasId: "canvas",
                x: PIC.min.x,
                y: PIC.min.y,
                width: PIC.width,
                height: PIC.height,
                success(res) {
                    let firstTime = new Date().valueOf();
                    that.setData({
                        imgUrl: res.tempFilePath,
                    });
                    let secondTime = new Date().valueOf();
                },
                fail(err) {
                    console.log(err);
                },
            },
            that
        );

        wx.canvasGetImageData(
            {
                canvasId: "canvas",
                x: PIC.min.x,
                y: PIC.min.y,
                width: len,
                height: len,
                success(res) {
                    const input = preprocess(that, res);
                    let firstTime2 = new Date().valueOf();
                    const preds = app.globalData.canvasModel
                        .predict(input)
                        .dataSync();
                    const pred = app.globalData.canvasModel
                        .predict(input)
                        .dataSync();
                    const indices = findIndicesOfMax(pred, MAX_PREDICT_LENGTH); // 找到序号
                    const names = getClassNames(that, indices); // 找到label
                    resolve(names);
                    let secondTime2 = new Date().valueOf();
                },
                fail(err) {
                    reject(err);
                },
            },
            that
        );
    });
}

/*
根据评分排序
*/
function findIndicesOfMax(inp, count) {
    var outp = [];
    for (var i = 0; i < inp.length; i++) {
        outp.push(i); // add index to output array
        if (outp.length > count) {
            outp.sort(function (a, b) {
                return inp[b] - inp[a];
            });
            outp.pop();
        }
    }
    return outp;
}

/*
  获得标签
  */
function getClassNames(that, indices) {
    var outp = [];
    for (var i = 0; i < indices.length; i++)
        outp[i] = that.data.labels[indices[i]];
    console.log(outp);
    return outp;
    // return indices
}

/*
  获得图片尺寸及x y左上坐标
*/
export function getPicBox(pointRecord) {
    var c = pointRecord;
    var coorX = c.map(function (p) {
        return p.x;
    });
    var coorY = c.map(function (p) {
        return p.y;
    });

    //find top left and bottom right corners
    var min_coords = {
        x: parseInt(Math.min.apply(null, coorX) - 6),
        y: parseInt(Math.min.apply(null, coorY) - 6),
    };
    var max_coords = {
        x: parseInt(Math.max.apply(null, coorX) + 6),
        y: parseInt(Math.max.apply(null, coorY) + 6),
    };
    // return as strucut
    return {
        min: min_coords,
        max: max_coords,
        height: max_coords.y - min_coords.y,
        width: max_coords.x - min_coords.x,
    };
}
