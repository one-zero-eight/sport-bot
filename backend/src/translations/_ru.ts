import type { Translation } from '.'

export default {
  'Welcome': 'Всё работает!',

  'HowGoodAmI.Thinking': 'Дай-ка подумаю 🤔',
  'HowGoodAmI.Answer': (percent: number) => `Ты лучше чем ${percent}% студентов!`,
  'HowGoodAmI.Failed': 'Я не знаю 🤷‍♂️',
} satisfies Translation
