import en from './_en'
import ru from './_ru'

export type Translation = typeof en
export type Language = keyof typeof translations

const translations = {
  en,
  ru,
}

export default translations
