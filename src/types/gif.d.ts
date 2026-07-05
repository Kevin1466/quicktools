declare module 'gifuct-js' {
  export function parseGIF(arrayBuffer: ArrayBuffer): unknown
  export function decompressFrames(gif: unknown, buildImagePatches: boolean): unknown[]
}

declare module 'gif.js.optimized' {
  export interface GifFrameOptions {
    delay?: number
    copy?: boolean
  }

  export interface GifOptions {
    workers?: number
    workerScript?: string
    quality?: number
    width?: number
    height?: number
    repeat?: number
  }

  export default class GIF {
    constructor(options?: GifOptions)
    addFrame(image: HTMLCanvasElement, options?: GifFrameOptions): void
    on(event: 'finished' | 'abort', cb: (...args: any[]) => void): void
    render(): void
  }
}

