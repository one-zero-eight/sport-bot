import { TIMEZONE } from '~/constants'
import type { TrainingDetailed } from '~/services/sport/types'
import { escapeHtml } from '~/utils/escape-html'

export default {
  'Welcome': 'Up and running!',

  'Buttons.Back': '← Back',

  'HowGoodAmI.Thinking': 'Hmm... Let me think 🤔',
  'HowGoodAmI.Answer': (percent: number) => `You're better than ${percent}% of students!`,
  'HowGoodAmI.Failed': 'I don\'t know 🤷‍♂️',

  'Views.Main.Message': 'Hi! Here is a list of actions:',
  'Views.Main.Buttons.Settings': '⚙️ Settings',
  'Views.Main.Buttons.Trainings': '⛹️ Classes',

  'Views.Settings.Message': 'A list of configurable things:',
  'Views.Settings.Buttons.Language': '🌐 Language',

  'Views.LanguageSettings.Message': 'Which flag do you like more?',

  'Views.TrainingsDaysList.Message': 'Choose the date:',
  'Views.TrainingsDaysList.Buttons.Day': (date: Date) => {
    const day = date.toLocaleDateString('en-US', { weekday: 'long', timeZone: TIMEZONE })
    const month = date.toLocaleDateString('en-US', { month: 'long', timeZone: TIMEZONE })
    const dayOfMonth = date.getDate()

    return `${day}, ${month} ${dayOfMonth}`
  },

  'Views.DayTrainings.Message': 'Choose the class:',

  'Views.Training.Message': ({
    title,
    startsAt,
    endsAt,
    accredited,
    description,
  }: TrainingDetailed) => {
    const date = startsAt.toLocaleDateString('en-US', { timeZone: TIMEZONE })
    const timeStart = startsAt.toLocaleTimeString('en-US', { timeZone: TIMEZONE })
    const timeEnd = endsAt.toLocaleTimeString('en-US', { timeZone: TIMEZONE })

    return [
      `<b>${escapeHtml(title)}</b>`,
      '',
      `<i>Date: ${date}</i>`,
      `<i>Time: ${timeStart}—${timeEnd}</i>`,
      `<i>Accreditted: ${accredited ? 'Yes' : 'No'}</i>`,
      '',
      '<i>Description:</i>',
      escapeHtml(description),
    ].join('\n')
  },
  'Views.Training.Buttons.CheckIn': 'Check-in',
  'Views.Training.Buttons.CancelCheckIn': 'Cancel check-in',
}
