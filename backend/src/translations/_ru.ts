import type { Translation } from '.'

export default {
  'Welcome': 'Всё работает!',

  'Buttons.Back': '← Назад',

  'HowGoodAmI.Thinking': 'Дай-ка подумаю 🤔',
  'HowGoodAmI.Answer': (percent: number) => `Ты лучше чем ${percent}% студентов!`,
  'HowGoodAmI.Failed': 'Я не знаю 🤷‍♂️',

  'Views.Main.Text': 'Привет! Вот что можно сделать:',
  'Views.Buttons.Settings': '⚙️ Настройки',

  'Views.Settings.Message': 'Настройки:',
  'Views.Settings.Buttons.Language': '🌐 Язык',

  'Views.LanguageSettings.Text': 'Ду ю спик инглишь?',
} satisfies Translation
