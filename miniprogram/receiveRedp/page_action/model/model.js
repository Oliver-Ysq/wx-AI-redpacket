import * as tf from "@tensorflow/tfjs-core";
import * as facemesh from "@tensorflow-models/facemesh";
const app = getApp();

export class Classifier {
    // 图像显示尺寸结构体 { width: Number, height: Number }
    displaySize;
    // 神经网络模型
    faceMesh;
    // ready
    ready;

    constructor(displaySize) {
        this.displaySize = {
            width: displaySize.width,
            height: displaySize.height,
        };
        this.ready = false;
    }

    load() {
        return new Promise((res, rej) => {
            facemesh
                .load()
                .then((model) => {
                    this.faceMesh = model;
                    this.ready = true;
                    console.log("actionModel 加载完成");
                    wx.hideLoading();
                    res();
                })
                .catch((err) => {
                    console.log("模型加载报错：", err);
                    this.load();
                    rej();
                });
        });
    }

    isReady() {
        return this.ready;
    }

    detectFace(frame) {
        return new Promise((resolve, reject) => {
            const video = tf.tidy(() => {
                const temp = tf.tensor(new Uint8Array(frame.data), [
                    frame.height,
                    frame.width,
                    4,
                ]);
                const sliceOptions = getFrameSliceOptions(
                    frame.width,
                    frame.height,
                    this.displaySize.width,
                    this.displaySize.height
                );
                return temp
                    .slice(sliceOptions.start, sliceOptions.size)
                    .resizeBilinear([
                        this.displaySize.height,
                        this.displaySize.width,
                    ]);
            });
            // since images are being fed from a webcam
            const flipHorizontal = false;
            this.faceMesh
                .estimateFaces(video, flipHorizontal)
                .then((face) => {
                    video.dispose();
                    resolve(face);
                })
                .catch((err) => {
                    console.log(err);
                    reject(err);
                });
        });
    }

    getAnswer(face, target) {
        return new Promise((resolve, reject) => {
            if (!face || face.length === 0) return;
            for (let i = 0; i < face.length; i++) {
                const left = face[i].scaledMesh[323];
                const right = face[i].scaledMesh[93];
                const top = face[i].scaledMesh[10];
                const buttom = face[i].scaledMesh[152];

                const delta_x = [
                    left[0] - right[0],
                    left[1] - right[1],
                    left[2] - right[2],
                ];
                const delta_y = [
                    top[0] - buttom[0],
                    top[1] - buttom[1],
                    top[2] - buttom[2],
                ];
                const res = [
                    this.angle([delta_x[0], delta_x[1]], [0, 1]) - 90,
                    -(this.angle([delta_x[0], delta_x[2]], [0, 1]) - 90),
                    this.angle([delta_y[1], delta_y[2]], [0, 1]) - 90,
                ];

                const list = this.headpose(res);
                console.log(list, target);
                list.includes(target) ? resolve() : reject();
            }
        });
    }

    angle(x, y) {
        let mX = Math.sqrt(x.reduce((acc, n) => acc + Math.pow(n, 2), 0));
        let mY = Math.sqrt(y.reduce((acc, n) => acc + Math.pow(n, 2), 0));
        return (
            (Math.acos(x.reduce((acc, n, i) => acc + n * y[i], 0) / (mX * mY)) *
                180) /
            Math.PI
        );
    }

    headpose(res) {
        let text = [];
        if (Math.abs(res[1]) > 10) text.push("摇头");

        if (res[2] > 8) text.push("低头");
        else if (res[2] < -8) text.push("抬头");

        if (Math.abs(res[0]) > 20) text.push("摆头");
        return text;
    }
}

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