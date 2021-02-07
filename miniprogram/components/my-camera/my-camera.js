const app = getApp();
const WrongWaitTime = 1200;
Component({
    properties: {
        titleText: {
            type: String,
            value: "",
        },
        maxWrongTime: {
            type: Number,
            value: 3,
        },
        wrongTime: {
            type: Number,
            value: 0,
        },
        bottomText: {
            type: String,
            value: "",
        },
        levelText: {
            type: String,
            value: "",
        },
        state: {
            type: Number,
            value: 0,
        },
        deviceType: {
            type: String,
            value: "back",
        },
        frameSize: {
            type: String,
            value: "medium",
        },
        activeType: {
            type: String,
            value: "1",
        },
        imgPath: {
            type: String,
            value: "",
        },
    },

    data: {
        nCounter: 0,
        listener: null,
        haveCanvas: false,
    },

    methods: {
        onCameraError(err) {
            wx.showToast({
                title: "Camera Error!",
                icon: "none",
                complete() {
                    wx.navigateBack({
                        delta: 1,
                    });
                },
            });
        },
    },
    lifetimes: {
        created() {
            this.setData({
                cameraHeight: app.globalData.appHeight * 0.79,
                cameraWidth:
                    parseInt((app.globalData.appWidth * 0.933) / 32) * 32,
            });
        },
        ready() {
            const that = this;
            const camera = wx.createCameraContext();
            const canvas = wx.createCanvasContext("getImg");
            that.triggerEvent("getCanvasThat", {
                that: that,
                camera: camera,
                canvas: canvas,
            });
            that.setData({
                haveCanvas: true,
            });

            if (!camera.onCameraFrame) {
                var message =
                    'Does not support the new api "Camera.onCameraFrame".';
                wx.showToast({
                    title: message,
                    icon: "none",
                });
                return;
            }

            that.setData(
                {
                    listener: camera.onCameraFrame((frame) => {
                        if (
                            that.data.wrongTime < that.data.maxWrongTime &&
                            that.data.haveCanvas
                        ) {
                            that.triggerEvent("handleFrame", {
                                frame: frame,
                            });
                        } else {
                            setTimeout(() => {
                                that.triggerEvent("setWrongTimeto0");
                            }, WrongWaitTime);
                        }
                    }),
                },
                () => {
                    that.data.listener.start();
                }
            );
        },
    },
    pageLifetimes: {
        show() {},

        hide() {
            const that = this;
            that.data.listener.stop();
            that.setData({
                listener: null,
                nCounter: 0,
            });
        },
    },
});
