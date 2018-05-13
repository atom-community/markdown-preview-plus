import { atomConfig } from '../../util'
import { remote } from 'electron'

export function shouldScrollSync(whatScrolled: 'editor' | 'preview') {
  const config = atomConfig().syncConfig
  if (config.syncEditorOnPreviewScroll && config.syncPreviewOnEditorScroll) {
    return remote.getCurrentWindow().isFocused()
  } else {
    return (
      (config.syncEditorOnPreviewScroll && whatScrolled === 'preview') ||
      (config.syncPreviewOnEditorScroll && whatScrolled === 'editor')
    )
  }
}
