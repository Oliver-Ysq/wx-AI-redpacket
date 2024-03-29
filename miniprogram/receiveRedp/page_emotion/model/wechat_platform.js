/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */

import {
  atob,
  btoa
} from 'abab';

// Implement the WeChat Platform for TFJS
export class PlatformWeChat {
  constructor(fetchFunc) {
    this.fetchFunc = fetchFunc;
  }
  fetch = (path, requestInits) => {
    return this.fetchFunc(path, requestInits);
  }
}

export const WECHAT_WEBGL_BACKEND_NAME = 'wechat-webgl';

/**
 * Setup the fetch polyfill and WebGL backend for WeChat.
 * @param config: SystemConfig object contains Tensorflow.js runtime, fetch
 *     polyfill and WeChat offline canvas.
 * @param debug: flag to enable/disable debugging.
 */
export function setupWechatPlatform(config, debug = false) {
  const tf = config.tf;
  if (debug) {
    console.log(tf);
  }
  // Skip initialization if the backend has been set.
  if (tf.getBackend() === WECHAT_WEBGL_BACKEND_NAME) {
    return;
  }
  tf.ENV.setPlatform('wechat', new PlatformWeChat(config.fetchFunc));
  setBase64Methods(tf);
  if (config.canvas) {
    initWebGL(tf, config.canvas, debug);
  }
}

/**
 * Polyfill btoa and atob method on the global scope which will be used by
 * model parser.
 */
export function setBase64Methods(tf) {
  tf.ENV.global.btoa = btoa;
  tf.ENV.global.atob = atob;
}

/**
 * Initialize webgl backend using the WebGLRenderingContext from the webgl
 * canvas node.
 * @param canvas: webgl canvas node container return from node selector.
 * @param platform: platform name where the mini app is running (ios, android,
 *     devtool).
 * @param debug: enable/disable debug logging.
 */
const BACKEND_PRIORITY = 2;
export function initWebGL(
  // tslint:disable-next-line:no-any
  tf, canvas, debug = false) {
  if (tf.findBackend(WECHAT_WEBGL_BACKEND_NAME) == null) {
    const WEBGL_ATTRIBUTES = {
      alpha: false,
      antialias: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      depth: false,
      stencil: false,
      failIfMajorPerformanceCaveat: true
    };
    const gl = canvas.getContext('webgl', WEBGL_ATTRIBUTES);
    if (debug) {
      console.log('start backend registration');
    }
    tf.webgl.setWebGLContext(1, gl);
    try {
      tf.registerBackend('wechat-webgl', () => {
        const context = new tf.webgl.GPGPUContext(gl);
        return new tf.webgl.MathBackendWebGL(context);
      }, BACKEND_PRIORITY);
    } catch (e) {
      throw (new Error(`Failed to register Webgl backend: ${e.message}`));
    }
  }
  tf.setBackend(WECHAT_WEBGL_BACKEND_NAME);
  if (debug) {
    console.log('current backend = ', tf.getBackend());
  }
}