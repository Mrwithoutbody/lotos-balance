// src/components/AnnaGuide.tsx
import avatar from '../assets/anna/anna-avatar.webp'

interface Props {
  text?: string
}

/**
 * Miejsce na krótkie prowadzenie Anny. Zdjęcie profilowe + tekst —
 * gdy pojawi się nagranie, wystarczy podmienić zawartość na odtwarzacz audio lub wideo.
 */
export function AnnaGuide({ text = 'krótkie prowadzenie Anny' }: Props) {
  return (
    <div className="anna-guide">
      <img className="anna-photo" src={avatar} alt="Anna Ryśnik" width={46} height={46} />
      <div className="grow">
        <p className="anna-text">{text}</p>
        <p className="tiny">Nagranie pojawi się w kolejnej wersji aplikacji.</p>
      </div>
    </div>
  )
}
