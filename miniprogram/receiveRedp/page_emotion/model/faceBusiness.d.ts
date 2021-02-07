declare function loadmodel(canvasId: string, isReverse: boolean): void;
declare function detect(
    frame: WechatMiniprogram.OnCameraFrameCallbackResult,
    canvasWidth: number,
    canvasHeight: number,
    target: string
): boolean;
export { loadmodel, detect };
