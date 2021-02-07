type IDisplaySize = { width: number; height: number };
export declare class Classifier {
    static displaySize: IDisplaySize;
    // 神经网络模型
    static faceMesh: any;
    // ready
    static ready: boolean;

    constructor(displaySize: IDisplaySize);

    load: () => Promise<any>;
    isReady: () => boolean;
    detectFace: (frame: {
        width: number;
        height: number;
        data: any;
    }) => Promise<any>;
    getAnswer: (face: any[], target: string) => Promise<any>;
    angle: (x: number[], y: number[]) => number;
    headpose: (res: number[]) => string[];
}
