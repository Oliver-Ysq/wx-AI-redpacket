import { check } from "../../utils/request/api.js";
import { post } from "../../utils/request/request.js";
import { throttle, formatMoney } from "../../utils/util";
const app = getApp();

interface IData {
    hasRequestData: boolean;
    infoList: any[];
    imgList: string[];

    redid?: number;
    question?: string;
    nickname?: string;
    activeType?: number;
    avatarUrl?: string;
}

Page<IData, WechatMiniprogram.IAnyObject>({
    data: {
        hasRequestData: false,
        infoList: [],
        imgList: [
            "/images/receiveAndShare/draw_rec.svg",
            "/images/receiveAndShare/emotion_rec.svg",
            "/images/receiveAndShare/scan_rec.svg",
            "/images/receiveAndShare/action_rec.svg",
        ],
    },

    //发送新红包
    sendNewRedp: throttle(() => {
        wx.reLaunch({
            url: "/pages/index/index",
        });
    }, 1000),

    //分享该红包
    share: throttle(() => {
        console.log("share");
        wx.showShareMenu({
            withShareTicket: true,
            menus: ["shareAppMessage"],
        });
    }, 1000),

    onLoad: function (options: { [key: string]: string }) {
        console.log(options);
        let that = this;
        that.setData({
            money: formatMoney(parseFloat(options.money)),
            question: options.question,
            nickname: options.nickname, //【发红包者】的昵称
            avatarUrl: options.avatarUrl,
            redid: parseInt(options.redid),
            activeType: parseInt(options.activeType),
            type: app.globalData.typeList[options.activeType],
            spendTime: options.spendTime || "",
            stateFlag: parseInt(options.moneyFlag), // 0:红包空了， -1:已领取过， 1：可以领取
            imgUrl: options.imgUrl || "",
        });

        wx.showShareMenu({
            withShareTicket: true,
            menus: ["shareAppMessage", "shareTimeline"],
        });
    },

    gotoMyRedp() {
        wx.navigateTo({
            url: "/pages/myRedp/myRedp",
        });
    },

    async onShow() {
        const that = this;
        let res = await post(check, {
            redid: that.data.redid,
        });
        console.log(res);
        that.setData(
            {
                infoList: res.data.info_list.map((v: { money: number }) =>
                    Object.assign(v, {
                        money: formatMoney(v.money),
                    })
                ),
                haveOpen: res.data.used_num,
                total: res.data.total_num,
                moneyLeft: formatMoney(res.data.remaining_money),
            },
            () => {
                that.setData({
                    hasRequestData: true,
                });
            }
        );
    },

    onHide() {
        this.setData({ hasRequestData: false });
    },

    onUnload: function () {},

    onShareAppMessage(res) {
        console.log(res);
        let that = this;
        if (res.from === "button") console.log(res.target);
        return {
            title: "转发红包",
            path:
                `/pages/ReceiveAndShare/ReceiveAndShare?question=` +
                that.data.question +
                "&nickName=" +
                that.data.nickname +
                "&redid=" +
                that.data.redid +
                "&activeType=" +
                that.data.activeType +
                "&avaUrl=" +
                that.data.avatarUrl,
            success() {
                // 转发成功
                console.log("转发成功");
                // let shareTickets = res.shareTickets;
                // if (shareTickets.length == 0) {
                //   return false;
                // }
                // 可以获取群组信息
                // wx.getShareInfo({
                //   shareTicket: shareTickets[0],
                //   success: function (res) {
                //     console.log(res)
                //   }
                // })
            },
            fail: () => console.log("转发失败"),
        };
    },
});
