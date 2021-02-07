interface IApp {
    globalData: {
        userInfo?: any;
        appWidth?: number;
        appHeight?: number;
        Width: number;
        Height: number;
        benchmarkLevel: number;
        baseLengthRatio: number;
        localStorageIO: any;
        fileStorageIO: any;
        activeType: number;
        typeList: string[];
        baseUrl: string;
        canvasModel: any;
        actionModel: any;
        sessionid?: string;
    };
}
declare var app: IApp;
interface AnyResult extends WechatMiniprogram.RequestSuccessCallbackResult {
    data: any;
}
