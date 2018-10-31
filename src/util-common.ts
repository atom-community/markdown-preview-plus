export function getMedia(document: HTMLDocument) {
  return document.querySelectorAll(
    'img[src],audio[src],video[src],link[href]',
  ) as NodeListOf<
    HTMLImageElement | HTMLAudioElement | HTMLVideoElement | HTMLLinkElement
  >
}
