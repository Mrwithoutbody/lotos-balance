// src/components/InstallButton.tsx
// Instalacja PWA — tylko na kręgu ("/"). Chrome/Android daje własny prompt,
// iOS nie ma beforeinstallprompt w żadnej przeglądarce, więc tam zostaje
// instrukcja ręczna — od iOS 16.4 działa tak samo w Safari i w Chrome.
import { useEffect, useState } from 'react'
import { Icon } from './Icon'

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (navigator as { standalone?: boolean }).standalone === true

const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent)

export function InstallButton() {
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(isStandalone)
  const [hint, setHint] = useState(false)

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault()
      setPrompt(e as InstallPromptEvent)
    }
    const onInstalled = () => {
      setInstalled(true)
      setPrompt(null)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  if (installed) return null
  if (!prompt && !isIos()) return null

  const install = async () => {
    if (!prompt) return setHint((v) => !v)
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setInstalled(true)
    setPrompt(null)
  }

  return (
    <div className="stack-sm">
      <button type="button" className="btn btn-ghost btn-sm" onClick={install}>
        <Icon name="Home" size={16} />
        Dodaj do ekranu telefonu
      </button>
      {hint && (
        <p className="tiny">
          Udostępnij (kwadrat ze strzałką) → „Do ekranu początkowego”. Tak samo w Safari
          i w Chrome (menu ⋯ → Udostępnij).
        </p>
      )}
    </div>
  )
}
