const miscStub = {
  handleScroll(callback: (event: WheelEvent) => void) {
    document.body.addEventListener('mousewheel', callback)
  },
}

interface Window {
  miscStub: MiscStub
}

type MiscStub = typeof miscStub

window.miscStub = miscStub
