export function getMedia(document: HTMLDocument) {
  return document.querySelectorAll(
    'img[src],audio[src],video[src]',
  ) as NodeListOf<HTMLImageElement | HTMLAudioElement | HTMLVideoElement>
}
