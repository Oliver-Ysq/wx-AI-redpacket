"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_js_1 = require("../../utils/request/api.js");
const request_js_1 = require("../../utils/request/request.js");
const util_1 = require("../../utils/util");
const app = getApp();
Page({
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
    sendNewRedp: util_1.throttle(() => {
        wx.reLaunch({
            url: "/pages/index/index",
        });
    }, 1000),
    share: util_1.throttle(() => {
        console.log("share");
        wx.showShareMenu({
            withShareTicket: true,
            menus: ["shareAppMessage"],
        });
    }, 1000),
    onLoad: function (options) {
        console.log(options);
        let that = this;
        that.setData({
            money: util_1.formatMoney(parseFloat(options.money)),
            question: options.question,
            nickname: options.nickname,
            avatarUrl: options.avatarUrl,
            redid: parseInt(options.redid),
            activeType: parseInt(options.activeType),
            type: app.globalData.typeList[options.activeType],
            spendTime: options.spendTime || "",
            stateFlag: parseInt(options.moneyFlag),
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
    onShow() {
        return __awaiter(this, void 0, void 0, function* () {
            const that = this;
            let res = yield request_js_1.post(api_js_1.check, {
                redid: that.data.redid,
            });
            console.log(res);
            that.setData({
                infoList: res.data.info_list.map((v) => Object.assign(v, {
                    money: util_1.formatMoney(v.money),
                })),
                haveOpen: res.data.used_num,
                total: res.data.total_num,
                moneyLeft: util_1.formatMoney(res.data.remaining_money),
            }, () => {
                that.setData({
                    hasRequestData: true,
                });
            });
        });
    },
    onHide() {
        this.setData({ hasRequestData: false });
    },
    onUnload: function () { },
    onShareAppMessage(res) {
        console.log(res);
        let that = this;
        if (res.from === "button")
            console.log(res.target);
        return {
            title: "转发红包",
            path: `/pages/ReceiveAndShare/ReceiveAndShare?question=` +
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
                console.log("转发成功");
            },
            fail: () => console.log("转发失败"),
        };
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0TW9uZXkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJnZXRNb25leS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsdURBQW1EO0FBQ25ELCtEQUFzRDtBQUN0RCwyQ0FBeUQ7QUFDekQsTUFBTSxHQUFHLEdBQUcsTUFBTSxFQUFFLENBQUM7QUFjckIsSUFBSSxDQUFzQztJQUN0QyxJQUFJLEVBQUU7UUFDRixjQUFjLEVBQUUsS0FBSztRQUNyQixRQUFRLEVBQUUsRUFBRTtRQUNaLE9BQU8sRUFBRTtZQUNMLHNDQUFzQztZQUN0Qyx5Q0FBeUM7WUFDekMsc0NBQXNDO1lBQ3RDLHdDQUF3QztTQUMzQztLQUNKO0lBR0QsV0FBVyxFQUFFLGVBQVEsQ0FBQyxHQUFHLEVBQUU7UUFDdkIsRUFBRSxDQUFDLFFBQVEsQ0FBQztZQUNSLEdBQUcsRUFBRSxvQkFBb0I7U0FDNUIsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxFQUFFLElBQUksQ0FBQztJQUdSLEtBQUssRUFBRSxlQUFRLENBQUMsR0FBRyxFQUFFO1FBQ2pCLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDckIsRUFBRSxDQUFDLGFBQWEsQ0FBQztZQUNiLGVBQWUsRUFBRSxJQUFJO1lBQ3JCLEtBQUssRUFBRSxDQUFDLGlCQUFpQixDQUFDO1NBQzdCLENBQUMsQ0FBQztJQUNQLENBQUMsRUFBRSxJQUFJLENBQUM7SUFFUixNQUFNLEVBQUUsVUFBVSxPQUFrQztRQUNoRCxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3JCLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQztRQUNoQixJQUFJLENBQUMsT0FBTyxDQUFDO1lBQ1QsS0FBSyxFQUFFLGtCQUFXLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM3QyxRQUFRLEVBQUUsT0FBTyxDQUFDLFFBQVE7WUFDMUIsUUFBUSxFQUFFLE9BQU8sQ0FBQyxRQUFR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RSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQztTQUNsQyxDQUFDO0lBQ04sQ0FBQztDQUNKLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNoZWNrIH0gZnJvbSBcIi4uLy4uL3V0aWxzL3JlcXVlc3QvYXBpLmpzXCI7XHJcbmltcG9ydCB7IHBvc3QgfSBmcm9tIFwiLi4vLi4vdXRpbHMvcmVxdWVzdC9yZXF1ZXN0LmpzXCI7XHJcbmltcG9ydCB7IHRocm90dGxlLCBmb3JtYXRNb25leSB9IGZyb20gXCIuLi8uLi91dGlscy91dGlsXCI7XHJcbmNvbnN0IGFwcCA9IGdldEFwcCgpO1xyXG5cclxuaW50ZXJmYWNlIElEYXRhIHtcclxuICAgIGhhc1JlcXVlc3REYXRhOiBib29sZWFuO1xyXG4gICAgaW5mb0xpc3Q6IGFueVtdO1xyXG4gICAgaW1nTGlzdDogc3RyaW5nW107XHJcblxyXG4gICAgcmVkaWQ/OiBudW1iZXI7XHJcbiAgICBxdWVzdGlvbj86IHN0cmluZztcclxuICAgIG5pY2tuYW1lPzogc3RyaW5nO1xyXG4gICAgYWN0aXZlVHlwZT86IG51bWJlcjtcclxuICAgIGF2YXRhclVybD86IHN0cmluZztcclxufVxyXG5cclxuUGFnZTxJRGF0YSwgV2VjaGF0TWluaXByb2dyYW0uSUFueU9iamVjdD4oe1xyXG4gICAgZGF0YToge1xyXG4gICAgICAgIGhhc1JlcXVlc3REYXRhOiBmYWxzZSxcclxuICAgICAgICBpbmZvTGlzdDogW10sXHJcbiAgICAgICAgaW1nTGlzdDogW1xyXG4gICAgICAgICAgICBcIi9pbWFnZXMvcmVjZWl2ZUFuZFNoYXJlL2RyYXdfcmVjLnN2Z1wiLFxyXG4gICAgICAgICAgICBcIi9pbWFnZXMvcmVjZWl2ZUFuZFNoYXJlL2Vtb3Rpb25fcmVjLnN2Z1wiLFxyXG4gICAgICAgICAgICBcIi9pbWFnZXMvcmVjZWl2ZUFuZFNoYXJlL3NjYW5fcmVjLnN2Z1wiLFxyXG4gICAgICAgICAgICBcIi9pbWFnZXMvcmVjZWl2ZUFuZFNoYXJlL2FjdGlvbl9yZWMuc3ZnXCIsXHJcbiAgICAgICAgXSxcclxuICAgIH0sXHJcblxyXG4gICAgLy/lj5HpgIHmlrDnuqLljIVcclxuICAgIHNlbmROZXdSZWRwOiB0aHJvdHRsZSgoKSA9PiB7XHJcbiAgICAgICAgd3gucmVMYXVuY2goe1xyXG4gICAgICAgICAgICB1cmw6IFwiL3BhZ2VzL2luZGV4L2luZGV4XCIsXHJcbiAgICAgICAgfSk7XHJcbiAgICB9LCAxMDAwKSxcclxuXHJcbiAgICAvL+WIhuS6q+ivpee6ouWMhVxyXG4gICAgc2hhcmU6IHRocm90dGxlKCgpID0+IHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcInNoYXJlXCIpO1xyXG4gICAgICAgIHd4LnNob3dTaGFyZU1lbnUoe1xyXG4gICAgICAgICAgICB3aXRoU2hhcmVUaWNrZXQ6IHRydWUsXHJcbiAgICAgICAgICAgIG1lbnVzOiBbXCJzaGFyZUFwcE1lc3NhZ2VcIl0sXHJcbiAgICAgICAgfSk7XHJcbiAgICB9LCAxMDAwKSxcclxuXHJcbiAgICBvbkxvYWQ6IGZ1bmN0aW9uIChvcHRpb25zOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9KSB7XHJcbiAgICAgICAgY29uc29sZS5sb2cob3B0aW9ucyk7XHJcbiAgICAgICAgbGV0IHRoYXQgPSB0aGlzO1xyXG4gICAgICAgIHRoYXQuc2V0RGF0YSh7XHJcbiAgICAgICAgICAgIG1vbmV5OiBmb3JtYXRNb25leShwYXJzZUZsb2F0KG9wdGlvbnMubW9uZXkpKSxcclxuICAgICAgICAgICAgcXVlc3Rpb246IG9wdGlvbnMucXVlc3Rpb24sXHJcbiAgICAgICAgICAgIG5pY2tuYW1lOiBvcHRpb25zLm5pY2tuYW1lLCAvL+OAkOWPkee6ouWMheiAheOAkeeahOaYteensFxyXG4gICAgICAgICAgICBhdmF0YXJVcmw6IG9wdGlvbnMuYXZhdGFyVXJsLFxyXG4gICAgICAgICAgICByZWRpZDogcGFyc2VJbnQob3B0aW9ucy5yZWRpZCksXHJcbiAgICAgICAgICAgIGFjdGl2ZVR5cGU6IHBhcnNlSW50KG9wdGlvbnMuYWN0aXZlVHlwZSksXHJcbiAgICAgICAgICAgIHR5cGU6IGFwcC5nbG9iYWxEYXRhLnR5cGVMaXN0W29wdGlvbnMuYWN0aXZlVHlwZV0sXHJcbiAgICAgICAgICAgIHNwZW5kVGltZTogb3B0aW9ucy5zcGVuZFRpbWUgfHwgXCJcIixcclxuICAgICAgICAgICAgc3RhdGVGbGFnOiBwYXJzZUludChvcHRpb25zLm1vbmV5RmxhZyksIC8vIDA657qi5YyF56m65LqG77yMIC0xOuW3sumihuWPlui/h++8jCAx77ya5Y+v5Lul6aKG5Y+WXHJcbiAgICAgICAgICAgIGltZ1VybDogb3B0aW9ucy5pbWdVcmwgfHwgXCJcIixcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgd3guc2hvd1NoYXJlTWVudSh7XHJcbiAgICAgICAgICAgIHdpdGhTaGFyZVRpY2tldDogdHJ1ZSxcclxuICAgICAgICAgICAgbWVudXM6IFtcInNoYXJlQXBwTWVzc2FnZVwiLCBcInNoYXJlVGltZWxpbmVcIl0sXHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG5cclxuICAgIGdvdG9NeVJlZHAoKSB7XHJcbiAgICAgICAgd3gubmF2aWdhdGVUbyh7XHJcbiAgICAgICAgICAgIHVybDogXCIvcGFnZXMvbXlSZWRwL215UmVkcFwiLFxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuXHJcbiAgICBhc3luYyBvblNob3coKSB7XHJcbiAgICAgICAgY29uc3QgdGhhdCA9IHRoaXM7XHJcbiAgICAgICAgbGV0IHJlcyA9IGF3YWl0IHBvc3QoY2hlY2ssIHtcclxuICAgICAgICAgICAgcmVkaWQ6IHRoYXQuZGF0YS5yZWRpZCxcclxuICAgICAgICB9KTtcclxuICAgICAgICBjb25zb2xlLmxvZyhyZXMpO1xyXG4gICAgICAgIHRoYXQuc2V0RGF0YShcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaW5mb0xpc3Q6IHJlcy5kYXRhLmluZm9fbGlzdC5tYXAoKHY6IHsgbW9uZXk6IG51bWJlciB9KSA9PlxyXG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24odiwge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtb25leTogZm9ybWF0TW9uZXkodi5tb25leSksXHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICksXHJcbiAgICAgICAgICAgICAgICBoYXZlT3BlbjogcmVzLmRhdGEudXNlZF9udW0sXHJcbiAgICAgICAgICAgICAgICB0b3RhbDogcmVzLmRhdGEudG90YWxfbnVtLFxyXG4gICAgICAgICAgICAgICAgbW9uZXlMZWZ0OiBmb3JtYXRNb25leShyZXMuZGF0YS5yZW1haW5pbmdfbW9uZXkpLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LnNldERhdGEoe1xyXG4gICAgICAgICAgICAgICAgICAgIGhhc1JlcXVlc3REYXRhOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICApO1xyXG4gICAgfSxcclxuXHJcbiAgICBvbkhpZGUoKSB7XHJcbiAgICAgICAgdGhpcy5zZXREYXRhKHsgaGFzUmVxdWVzdERhdGE6IGZhbHNlIH0pO1xyXG4gICAgfSxcclxuXHJcbiAgICBvblVubG9hZDogZnVuY3Rpb24gKCkge30sXHJcblxyXG4gICAgb25TaGFyZUFwcE1lc3NhZ2UocmVzKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2cocmVzKTtcclxuICAgICAgICBsZXQgdGhhdCA9IHRoaXM7XHJcbiAgICAgICAgaWYgKHJlcy5mcm9tID09PSBcImJ1dHRvblwiKSBjb25zb2xlLmxvZyhyZXMudGFyZ2V0KTtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB0aXRsZTogXCLovazlj5HnuqLljIVcIixcclxuICAgICAgICAgICAgcGF0aDpcclxuICAgICAgICAgICAgICAgIGAvcGFnZXMvUmVjZWl2ZUFuZFNoYXJlL1JlY2VpdmVBbmRTaGFyZT9xdWVzdGlvbj1gICtcclxuICAgICAgICAgICAgICAgIHRoYXQuZGF0YS5xdWVzdGlvbiArXHJcbiAgICAgICAgICAgICAgICBcIiZuaWNrTmFtZT1cIiArXHJcbiAgICAgICAgICAgICAgICB0aGF0LmRhdGEubmlja25hbWUgK1xyXG4gICAgICAgICAgICAgICAgXCImcmVkaWQ9XCIgK1xyXG4gICAgICAgICAgICAgICAgdGhhdC5kYXRhLnJlZGlkICtcclxuICAgICAgICAgICAgICAgIFwiJmFjdGl2ZVR5cGU9XCIgK1xyXG4gICAgICAgICAgICAgICAgdGhhdC5kYXRhLmFjdGl2ZVR5cGUgK1xyXG4gICAgICAgICAgICAgICAgXCImYXZhVXJsPVwiICtcclxuICAgICAgICAgICAgICAgIHRoYXQuZGF0YS5hdmF0YXJVcmwsXHJcbiAgICAgICAgICAgIHN1Y2Nlc3MoKSB7XHJcbiAgICAgICAgICAgICAgICAvLyDovazlj5HmiJDlip9cclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi6L2s5Y+R5oiQ5YqfXCIpO1xyXG4gICAgICAgICAgICAgICAgLy8gbGV0IHNoYXJlVGlja2V0cyA9IHJlcy5zaGFyZVRpY2tldHM7XHJcbiAgICAgICAgICAgICAgICAvLyBpZiAoc2hhcmVUaWNrZXRzLmxlbmd0aCA9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAvLyAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIC8vIH1cclxuICAgICAgICAgICAgICAgIC8vIOWPr+S7peiOt+WPlue+pOe7hOS/oeaBr1xyXG4gICAgICAgICAgICAgICAgLy8gd3guZ2V0U2hhcmVJbmZvKHtcclxuICAgICAgICAgICAgICAgIC8vICAgc2hhcmVUaWNrZXQ6IHNoYXJlVGlja2V0c1swXSxcclxuICAgICAgICAgICAgICAgIC8vICAgc3VjY2VzczogZnVuY3Rpb24gKHJlcykge1xyXG4gICAgICAgICAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKHJlcylcclxuICAgICAgICAgICAgICAgIC8vICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gfSlcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZmFpbDogKCkgPT4gY29uc29sZS5sb2coXCLovazlj5HlpLHotKVcIiksXHJcbiAgICAgICAgfTtcclxuICAgIH0sXHJcbn0pO1xyXG4iXX0=