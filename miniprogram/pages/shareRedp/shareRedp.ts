import { throttle } from "../../utils/util";
// import { Card } from "./card/card";
// import { saveImageToPhotosAlbumByWX } from "../../utils/util";
const app = getApp();
interface IData {
    question?: string;
    quesList?: string | undefined;
    userInfo?: { nickname: string; avatarUrl: string };
    renderOver: boolean;
    redid?: number;
    activeType?: number;
    actionType?: number | undefined;
    imgurl?: string;
}
Page<IData, WechatMiniprogram.IAnyObject>({
    data: {
        renderOver: false,
    },

    //分享红包：使用节流，时间为1s
    share: throttle(() => {
        console.log("share");
    }, 1000),

    //去发送新红包：使用节流，时间为1s
    setNewRedp: throttle(() => {
        wx.reLaunch({
            url: "/pages/index/index",
        });
    }, 1000),

    test() {
        const that = this;
        if (!that.data.userInfo) return;
        wx.navigateTo({
            url: `/receiveRedp/receiveRedp?question=${that.data.question}&quesList=${that.data.quesList}&nickName=${that.data.userInfo.nickname}&avaUrl=${that.data.userInfo.avatarUrl}&redid=${that.data.redid}&activeType=${that.data.activeType}&actionType=${that.data.actionType}`,
            fail(err) {
                console.log(err);
            },
        });
    },

    onLoad: function (options: { [key: string]: string }) {
        console.log(options)
        const that = this;
        that.setData({
            userInfo: {
                nickname: options.nickName,
                avatarUrl: options.avaUrl,
            },
            question: options.question,
            quesList: options.quesList,
            activeType: parseInt(options.activeType),
            actionType: !options.actionType
                ? undefined
                : parseInt(options.actionType),
            type: app.globalData.typeList[parseInt(options.activeType)],
            redid: parseInt(options.redid),
            // template: new Card().palette({
            //   "avaUrl": options.avaUrl,
            //   "nickName": "杨盛淇",
            //   "midImgUrl": `https://weixinredpacket-1258344707.file.myqcloud.com/mobilenet/static/${map[options.activeType]}_rec.png`,
            //   "qrcodeUrl": `https://weixinredpacket-1258344707.file.myqcloud.com/mobilenet/static/${map[options.activeType]}_rec.png`
            // })
        });

        wx.getSystemInfo({
            success(res) {
                // 通过像素比计算出画布的实际大小（330x490）是展示的出来的大小
                that.setData({
                    pixelRatio: res.pixelRatio,
                    width: 285 * res.pixelRatio,
                    height: 400 * res.pixelRatio,
                });
            },
        });

        wx.showShareMenu({
            withShareTicket: true,
            menus: ["shareAppMessage"],
        });
    },

    // saveImg() {
    //     const that = this;
    //     wx.getSetting({
    //         //查看保存图片权限
    //         success: (res) => {
    //             if (!res.authSetting["scope.writePhotosAlbum"]) {
    //                 wx.authorize({
    //                     scope: "scope.writePhotosAlbum",
    //                     success: () => {
    //                         saveImageToPhotosAlbumByWX(that.data.imgurl);
    //                     },
    //                     fail: () => {
    //                         wx.showToast({
    //                             icon: "none",
    //                             title: '请先进行"保存图片"授权哦',
    //                         });
    //                     },
    //                 });
    //             } else saveImageToPhotosAlbumByWX(that.data.imgurl);
    //         },
    //     });
    // },

    onImgOK(e: any) {
        console.log(e.detail.path);
        this.setData({
            imgurl: e.detail.path,
        });
    },

    onImgErr(err: any) {
        console.log(err);
        wx.showToast({
            title: "生成失败",
            icon: "none",
        });
    },

    async onReady() {},

    onShow: function () {},

    onHide: function () {},

    onShareAppMessage: function (res) {
        const that = this;
        if (res.from === "button") console.log(res.target);
        return {
            title: "转发红包",
            query: {
                activeType: that.data.activeType,
            },
            imageUrl: "/images/share/zhuan.png",

            path: `/receiveRedp/receiveRedp?question=${
                that.data.question
            }&quesList=${that.data.quesList}&nickName=${
                (that.data.userInfo as any).nickname
            }&avaUrl=${(that.data.userInfo as any).avatarUrl}&redid=${
                that.data.redid
            }&activeType=${that.data.activeType}&actionType=${
                that.data.actionType
            }`,

            success: (res: any) =>
                console.log("转发成功:" + JSON.stringify(res)),
            fail: (res: any) => console.log("转发失败:" + JSON.stringify(res)),
        };
    },
});
