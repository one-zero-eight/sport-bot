import type { Translation } from '.'
import { TIMEZONE } from '~/constants'
import type { TrainingDetailed } from '~/services/sport/types'
import { escapeHtml } from '~/utils/escape-html'

export default {
  'Welcome': 'Всё работает!',

  'Buttons.Back': '← Назад',

  'HowGoodAmI.Thinking': 'Дай-ка подумаю 🤔',
  'HowGoodAmI.Answer': (percent: number) => `Ты лучше чем ${percent}% студентов!`,
  'HowGoodAmI.Failed': 'Я не знаю 🤷‍♂️',

  'Views.Main.Message': 'Привет! Вот что можно сделать:',
  'Views.Main.Buttons.Settings': '⚙️ Настройки',
  'Views.Main.Buttons.Trainings': '⛹️ Тренировки',

  'Views.Settings.Message': 'Настройки:',
  'Views.Settings.Buttons.Language': '🌐 Язык',

  'Views.LanguageSettings.Message': 'Ду ю спик инглишь?',

  'Views.TrainingsDaysList.Message': 'Выбери дату:',
  'Views.TrainingsDaysList.Buttons.Day': (date: Date) => {
    const day = date.toLocaleDateString('ru-RU', { weekday: 'long' })
    const month = date.toLocaleDateString('ru-RU', { month: 'long' })
    const dayOfMonth = date.getDate()

    return `${day}, ${dayOfMonth} ${month}`
  },

  'Views.DayTrainings.Message': 'Выбери занятие:',

  'Views.Training.Message': ({
    title,
    startsAt,
    endsAt,
    accredited,
    description,
  }: TrainingDetailed) => {
    const date = startsAt.toLocaleDateString('ru-RU', { timeZone: TIMEZONE })
    const timeStart = startsAt.toLocaleTimeString('ru-RU', { timeZone: TIMEZONE })
    const timeEnd = endsAt.toLocaleTimeString('ru-RU', { timeZone: TIMEZONE })

    return [
      `<b>${escapeHtml(title)}</b>`,
      '',
      `<i>Дата: ${date}</i>`,
      `<i>Время: ${timeStart}—${timeEnd}</i>`,
      `<i>Аккредитовано: ${accredited ? 'Yes' : 'No'}</i>`,
      '',
      '<i>Описание:</i>',
      escapeHtml(description),
    ].join('\n')
  },
  'Views.Training.Buttons.CheckIn': 'Записаться',
  'Views.Training.Buttons.CancelCheckIn': 'Отменить запись',
} satisfies Translation
