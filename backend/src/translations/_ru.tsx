import { pluralize } from './utils'
import type { Translation } from '.'
import { TIMEZONE } from '~/constants'
import type { TrainingDetailed } from '~/services/sport/types'
import type { Weekday } from '~/utils/dates'
import { clockTime } from '~/utils/dates'
import { tgxFromHtml } from '~/utils/tgx-from-html'
import type { SemesterSummary } from '~/domain/types'

function dateLong(date: Date): string {
  const weekDayShort = date.toLocaleDateString('ru-RU', { weekday: 'long', timeZone: TIMEZONE })
  let month = date.toLocaleDateString('ru-RU', { month: 'numeric', timeZone: TIMEZONE })
  let dayOfMonth = date.toLocaleDateString('ru-RU', { day: 'numeric', timeZone: TIMEZONE })
  const year = date.toLocaleDateString('ru-RU', { year: 'numeric', timeZone: TIMEZONE })

  month = month.length === 1 ? `0${month}` : month
  dayOfMonth = dayOfMonth.length === 1 ? `0${dayOfMonth}` : dayOfMonth

  return `${weekDayShort}, ${dayOfMonth}.${month}.${year}`
}

function dateAndTimeShort(
  startsAt: Date,
  endsAt: Date,
): string {
  const weekDayShort = startsAt.toLocaleDateString('ru-RU', { weekday: 'long', timeZone: TIMEZONE })
  let month = startsAt.toLocaleDateString('ru-RU', { month: 'numeric', timeZone: TIMEZONE })
  let dayOfMonth = startsAt.toLocaleDateString('ru-RU', { day: 'numeric', timeZone: TIMEZONE })
  const year = startsAt.toLocaleDateString('ru-RU', { year: 'numeric', timeZone: TIMEZONE })

  month = month.length === 1 ? `0${month}` : month
  dayOfMonth = dayOfMonth.length === 1 ? `0${dayOfMonth}` : dayOfMonth

  const weekDayCapitalized = weekDayShort.charAt(0).toUpperCase() + weekDayShort.slice(1)

  return `${weekDayCapitalized}, ${dayOfMonth}.${month}.${year} в ${clockTime(startsAt, TIMEZONE)}—${clockTime(endsAt, TIMEZONE)}`
}

function beautifulSemesterTitle(raw: string): string {
  const match = raw.toLowerCase().match(/^([sf]|sum)(\d{2})$/i)
  if (!match) {
    return raw
  }

  const [, season, year] = match
  const seasonName = season === 's' ? 'Весна' : season === 'f' ? 'Осень' : 'Лето'
  const emoji = season === 's' ? '🌷' : season === 'f' ? '🍂' : '☀️'
  const formattedYear = `20${year}`
  return `${seasonName} ${formattedYear} ${emoji}`
}

const INSPIRING_QUOTES = [
  'Неважно, как медленно ты продвигаешься, главное, что ты не останавливаешься.',
  'Не имей 100 друзей, а имей 100 часов.',
]

export default {
  'Bot.Commands': {
    menu: 'главное меню',
    help: 'о боте',
  },
  'Bot.About': 'Я помогаю студентам Иннополиса следить за прогрессом по спорту и записываться на занятия в пару кликов, а ещё показываю личный календарь со всеми занятиями.',
  'Bot.Bio': 'Помогаю закрывать спорт студентам Иннополиса.\n\ngithub.com/one-zero-eight/sport-bot',

  'Messages.WelcomeUnauthorized': (
    <>
      <b>Привет, я IU Sport бот! 💪</b>
      <br />
      <br />
      Я могу записать тебя на занятия, показать твой прогресс и расписание тренировок.
      <br />
      <br />
      Но для начала мне нужно, чтобы ты вошёл в свой InNoHassle аккаунт.
    </>
  ),
  'Messages.Help': (
    <>
      Этот бот может записать тебя на занятия, показать твой прогресс и расписание тренировок.
      <br />
      <br />
      <b>Команды:</b>
      <br />
      /menu — отправить главное меню
      <br />
      /help — отправить это сообщение
      <br />
      <br />
      Если нашёл баг или есть хорошая идея, то можешь создать issue в
      {' '}
      <a href="https://github.com/one-zero-eight/sport-bot">GitHub репозитории</a>
      {' '}
      — любая помощь приветствуется! Обратной связью можно поделиться с мэйнтейнером: @evermake.
      <br />
      <br />
      <i>с 💜 от @one_zero_eight</i>
    </>
  ),

  'Buttons.Back': '← Назад',
  'Buttons.LoginWithInnohassle': 'Войти через InNoHassle',

  'HowGoodAmI.Thinking': 'Дай-ка подумаю 🤔',
  'HowGoodAmI.Answer': (percent: number) => `Ты лучше ${percent}% студентов!`,
  'HowGoodAmI.Failed': 'Я не знаю 🤷‍♂️',

  'Alert.CheckInSuccessfulText': 'Запись создана.',
  'Alert.CheckInSuccessful': ({ title, startsAt, endsAt }: TrainingDetailed) => [
    'Запись создана.',
    '',
    title,
    dateAndTimeShort(startsAt, endsAt),
  ].join('\n'),
  'Alert.CheckInCancelledText': 'Запись отменена.',
  'Alert.CheckInCancelled': ({ title, startsAt, endsAt }: TrainingDetailed) => [
    'Запись отменена.',
    '',
    title,
    dateAndTimeShort(startsAt, endsAt),
  ].join('\n'),
  'Alert.CheckInUnavailable': 'Ты не можешь записаться на это занятие.',
  'Alert.AlreadyCheckedIn': 'Ты уже записан на это занятие.',
  'Alert.NotCheckedIn': 'Ты не записан на это занятие.',
  'Alert.CheckInError': 'Произошла ошибка во время записи.',
  'Alert.CancelCheckInError': 'Произошла ошибка во время отмены записи.',

  'Views.Main.Message': ({
    earned,
    required,
    debt,
  }: {
    earned: number // earned w/o debt
    required: number // required w/o debt
    debt: number
  }) => {
    if (earned >= required + debt) {
      return (
        <>
          <b>Текущий прогресс:</b>
          <br />
          {`🎉 ${earned} ${pluralize(earned, 'час', 'часа', 'часов')} из ${required}${debt ? `+${debt} (долг)` : ''} 🎉`}
        </>
      )
    } else {
      return (
        <>
          <b>Текущий прогресс:</b>
          <br />
          {`${earned} ${pluralize(earned, 'час', 'часа', 'часов')} из ${required}${debt ? `+${debt} (долг)` : ''}`}
          <br />
          <blockquote>{INSPIRING_QUOTES[Math.floor(Math.random() * INSPIRING_QUOTES.length)]}</blockquote>
        </>
      )
    }
  },
  'Views.Main.Buttons.Refresh': '🔄 Обновить',
  'Views.Main.Buttons.Trainings': '⛹️ Занятия',
  'Views.Main.Buttons.Semesters': '📊 Семестры',
  'Views.Main.Buttons.Website': '🌐 Сайт',
  'Views.Main.Buttons.Calendar': '📆 Календарь',
  'Views.Main.Alerts.Refreshed': 'Обновлено!',

  'Views.TrainingsDaysList.Message': 'Выбери дату:',

  'Views.DayTrainings.Message': 'Выбери занятие:',

  'Views.Training.Message': ({
    title,
    startsAt,
    endsAt,
    accredited,
    description,
    teachers,
  }: TrainingDetailed) => (
    <>
      <b>{title}</b>
      <br />
      <br />
      <b>Дата: </b>
      {dateLong(startsAt)}
      <br />
      <b>Время: </b>
      {`${clockTime(startsAt, TIMEZONE)}—${clockTime(endsAt, TIMEZONE)}`}
      <br />
      <b>Аккредитовано: </b>
      {accredited ? 'да' : 'нет'}
      <br />
      {(teachers.length > 0) && (
        <>
          <br />
          <b>Тренеры:</b>
          <br />
          {teachers.map(teacher => `• ${teacher.firstName} ${teacher.lastName} (${teacher.email})\n`)}
        </>
      )}
      {(description.trim() && (
        <>
          <br />
          <b>Описание:</b>
          <br />
          {tgxFromHtml(description)}
        </>
      ))}
    </>
  ),
  'Views.Training.Buttons.CheckIn': 'Записаться',
  'Views.Training.Buttons.CancelCheckIn': 'Отменить запись',

  'Views.SemestersSummary.SummaryMessage': (semesters: SemesterSummary[]) => (
    <>
      <b>История семестров</b>
      <br />
      <br />
      {semesters.map(({ title, hoursTotal, fitnessTest }) => (
        <>
          {beautifulSemesterTitle(title)}
          <br />
          {(hoursTotal != null) && (
            <>
              {`• ${hoursTotal} ${pluralize(hoursTotal, 'час', 'часа', 'часов')}`}
              <br />
            </>
          )}
          {fitnessTest && (
            <>
              {`• Фитнес-тест: ${fitnessTest.pointsTotal} ${pluralize(fitnessTest.pointsTotal, 'балл', 'балла', 'баллов')} (${fitnessTest.passed ? 'сдан' : 'не сдан'})`}
              <br />
            </>
          )}
          <br />
        </>
      ))}
    </>
  ),

  'Weekday.TwoLetters': (weekday: Weekday) => {
    switch (weekday) {
      case 'mon': return 'Пн'
      case 'tue': return 'Вт'
      case 'wed': return 'Ср'
      case 'thu': return 'Чт'
      case 'fri': return 'Пт'
      case 'sat': return 'Сб'
      case 'sun': return 'Вс'
    }
  },
} satisfies Translation
