// pages/myRedp/myRedp.js
import { sendInfo, recInfo } from "../../utils/request/api.js";
import { post } from "../../utils/request/request";
import { formatMoney } from "../../utils/util";
const app = getApp();
Page({
    data: {
        active: 0,

        moneySend: 0,
        numberSend: 0,
        moneyReceive: 0,
        numberReceive: 0,

        hasRecInfo: false,
        hasSendInfo: false,
    },

    //  切换发送 or 接收红包
    switchTab(e: any) {
        const that = this;
        this.setData({
            active: parseInt(e.target.dataset.id),
        });
        if (e.target.dataset.id == 1 && !that.data.hasRecInfo) {
            that.getRecInfo();
        } else if (e.target.dataset.id == 0 && !that.data.hasSendInfo) {
            that.getSendInfo();
        }
    },
    change(e: any) {
        const that = this;
        that.setData({
            active: e.detail.current,
        });
        if (e.detail.current == 1 && !that.data.hasRecInfo) {
            that.getRecInfo();
        } else if (e.detail.current == 0 && !that.data.hasSendInfo) {
            that.getSendInfo();
        }
    },

    // 通过request请求接收红包信息
    getRecInfo() {
        const that = this;
        post(recInfo, {
            sessionid: app.globalData.sessionid,
        })
            .then((res) => {
                console.log(res);
                let data = res.data;
                that.setData({
                    numberReceive: data.total_num,
                    moneyReceive: formatMoney(data.total_money),
                    receiveList: data.packet_list.map((v: { money: number }) =>
                        Object.assign(v, {
                            money: formatMoney(v.money),
                        })
                    ),
                    hasRecInfo: true,
                });
            })
            .catch((err) => console.log(err));
    },

    // 通过request请求发送红包信息
    getSendInfo() {
        const that = this;
        post(sendInfo, {
            sessionid: app.globalData.sessionid,
        })
            .then((res) => {
                console.log(res)
                let data = res.data;
                that.setData({
                    numberSend: data.total_num,
                    moneySend: formatMoney(data.total_money),
                    sendList: data.packet_list.map(
                        (v: { total_money: number }) =>
                            Object.assign(v, {
                                total_money: formatMoney(v.total_money),
                            })
                    ),
                    hasSendInfo: true,
                });
            })
            .catch((err) => console.log(err));
    },

    onLoad: function () {
        const that = this;
        console.log(app.globalData.userInfo.avatarUrl)
        that.setData({
            avatarUrl: app.globalData.userInfo.avatarUrl,
            nickname: app.globalData.userInfo.nickName,
        });
        wx.hideShareMenu({
            menus: ["shareAppMessage", "shareTimeline"],
        });
        that.getSendInfo();
        that.getRecInfo();
    },

    onReady: function () { },

    onShow: function () { },

    onHide: function () { },

    onUnload: function () { },

    onPullDownRefresh: function () { },

    onReachBottom: function () { },
});
