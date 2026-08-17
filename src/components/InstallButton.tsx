// src/components/InstallButton.tsx
// Skrót na ekran telefonu — tylko na kręgu ("/"). Jeśli przeglądarka da
// beforeinstallprompt, klik odpala jej własny prompt; jeśli nie, pokazujemy
// drogę ręczną. Na iOS zdarzenia nie ma w żadnej przeglądarce, ale od 16.4
// „Do ekranu początkowego” działa tak samo w Safari i w Chrome.
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

  // Poza trybem standalone przycisk jest zawsze. beforeinstallprompt to sygnał
  // uznaniowy — Chrome milczy po odrzuceniu prompta i bywa cicho po odinstalowaniu,
  // a przez menu przeglądarki skrót da się dodać zawsze. Bez prompta pokazujemy
  // instrukcję ręczną, tak jak na iOS, gdzie tego zdarzenia nie ma w ogóle.
  if (installed) return null

  const install = async () => {
    if (!prompt) return setHint((v) => !v)
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setInstalled(true)
    setPrompt(null)
  }

  return (
    <div className="install-bar">
      <button type="button" className="btn btn-ghost btn-sm" onClick={install}>
        <Icon name="Home" size={16} />
        Dodaj do ekranu telefonu
      </button>
      {hint && (
        <p className="tiny">
          {isIos()
            ? 'Udostępnij (kwadrat ze strzałką) → „Do ekranu początkowego”. Tak samo w Safari i w Chrome (menu ⋯ → Udostępnij).'
            : 'Menu przeglądarki (⋮) → „Dodaj do ekranu głównego”.'}
        </p>
      )}
    </div>
  )
}
