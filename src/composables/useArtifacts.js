import { ref } from 'vue'
import { useToasts } from './useToasts'

const currentArtifact = ref(null)
const artifactsOpen = ref(false)
const artifactsFullscreen = ref(false)

export function useArtifacts() {
  const { showToast } = useToasts()

  const openArtifact = (artifact) => {
    currentArtifact.value = artifact
    artifactsOpen.value = true
    artifactsFullscreen.value = false
  }

  const closeArtifacts = () => {
    artifactsOpen.value = false
    artifactsFullscreen.value = false
    currentArtifact.value = null
  }

  const toggleFullscreen = () => {
    artifactsFullscreen.value = !artifactsFullscreen.value
  }

  const copyArtifact = (artifact) => {
    copyToClipboard(artifact.code)
    showToast('Код скопирован в буфер обмена', 'success')
  }

  const openArtifactInPlayground = (artifact) => {
    currentArtifact.value = artifact
    artifactsOpen.value = true
    // Switch to playground tab - this would be handled by the ArtifactsPanel component
    showToast('Код загружен в Playground', 'success')
  }

  const openArtifactInPreview = (artifact) => {
    currentArtifact.value = artifact
    artifactsOpen.value = true
    // Switch to preview tab - this would be handled by the ArtifactsPanel component
    showToast('Предпросмотр открыт', 'success')
  }

  const copyToClipboard = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text)
      } catch (error) {
        fallbackCopyToClipboard(text)
      }
    } else {
      fallbackCopyToClipboard(text)
    }
  }

  const fallbackCopyToClipboard = (text) => {
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    try {
      document.execCommand('copy')
    } catch (error) {
      console.error('Failed to copy text:', error)
    } finally {
      textArea.remove()
    }
  }

  return {
    currentArtifact,
    artifactsOpen,
    artifactsFullscreen,
    openArtifact,
    closeArtifacts,
    toggleFullscreen,
    copyArtifact,
    openArtifactInPlayground,
    openArtifactInPreview
  }
}