import { createContext, useContext, useEffect, useState } from 'react'
import { content } from './content.js'

/* Taal-context: NL is de basis, EN is de schakelaar.
   Voorkeur wordt onthouden in localStorage en op <html lang> gezet. */
const LangContext = createContext(null)

const STORAGE_KEY = 'elan-lang'

function initialLang() {
  if (typeof window === 'undefined') return 'nl'
  const saved = window.localStorage.getItem(STORAGE_KEY)
  if (saved === 'nl' || saved === 'en') return saved
  return 'nl'
}

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(initialLang)

  useEffect(() => {
    document.documentElement.lang = lang
    window.localStorage.setItem(STORAGE_KEY, lang)
  }, [lang])

  const setLang = (l) => setLangState(l === 'en' ? 'en' : 'nl')
  const toggle = () => setLangState((l) => (l === 'nl' ? 'en' : 'nl'))

  const value = { lang, setLang, toggle, t: content[lang] }
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

/* Hook: geeft { lang, setLang, toggle, t } — `t` is de content voor de actieve taal. */
export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang moet binnen <LangProvider> gebruikt worden')
  return ctx
}
