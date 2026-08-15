// src/components/AnnaGuide.tsx

interface Props {
  text?: string
}

/**
 * Miejsce na krótkie prowadzenie Anny. Na razie elegancki placeholder z monogramem —
 * gdy pojawi się nagranie, wystarczy podmienić zawartość na odtwarzacz audio lub wideo.
 */
export function AnnaGuide({ text = 'krótkie prowadzenie Anny' }: Props) {
  return (
    <div className="anna-guide">
      <span className="anna-monogram" aria-hidden="true">
        A
      </span>
      <div className="grow">
        <p className="anna-text">{text}</p>
        <p className="tiny">Nagranie pojawi się w kolejnej wersji aplikacji.</p>
      </div>
    </div>
  )
}
