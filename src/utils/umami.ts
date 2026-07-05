type UmamiTrackPayload = Record<string, unknown> | ((props: Record<string, unknown>) => Record<string, unknown>)

interface UmamiTracker {
  track: {
    (): void
    (payload: UmamiTrackPayload): void
    (eventName: string): void
    (eventName: string, data: Record<string, unknown>): void
  }
  identify: {
    (uniqueId: string): void
    (uniqueId: string, data: Record<string, unknown>): void
    (data: Record<string, unknown>): void
  }
}

declare global {
  interface Window {
    umami?: UmamiTracker
  }
}

let pending: Array<() => void> = []
let didBindReady = false

const isEnabled = () => {
  const v = import.meta.env.VITE_UMAMI_ENABLED
  if (v === undefined) return true
  return String(v).toLowerCase() !== 'false'
}

const flushPending = () => {
  if (!window.umami) return
  const q = pending
  pending = []
  q.forEach((fn) => fn())
}

const enqueue = (fn: () => void) => {
  if (!isEnabled()) return
  if (window.umami) {
    fn()
    return
  }
  pending.push(fn)
}

export const loadUmami = () => {
  if (!isEnabled()) return
  const src = import.meta.env.VITE_UMAMI_SRC
  const websiteId = import.meta.env.VITE_UMAMI_WEBSITE_ID
  if (!src || !websiteId) return

  const existed = document.querySelector(`script[data-website-id="${websiteId}"]`)
  if (existed) {
    if (!didBindReady) {
      didBindReady = true
      const timer = window.setInterval(() => {
        if (window.umami) {
          window.clearInterval(timer)
          flushPending()
        }
      }, 200)
    }
    return
  }

  const script = document.createElement('script')
  script.async = true
  script.defer = true
  script.src = src
  script.setAttribute('data-website-id', websiteId)
  script.setAttribute('data-auto-track', 'false')
  script.addEventListener('load', () => flushPending())
  document.head.appendChild(script)
}

export const umamiTrackPageView = (url?: string, title?: string) => {
  enqueue(() => {
    const tracker = window.umami
    if (!tracker) return

    if (!url && !title) {
      tracker.track()
      return
    }

    tracker.track((props) => ({
      ...props,
      ...(url ? { url } : null),
      ...(title ? { title } : null),
    }))
  })
}

export const umamiTrackEvent = (eventName: string, data?: Record<string, unknown>) => {
  enqueue(() => {
    const tracker = window.umami
    if (!tracker) return

    if (data) {
      tracker.track(eventName, data)
      return
    }
    tracker.track(eventName)
  })
}
