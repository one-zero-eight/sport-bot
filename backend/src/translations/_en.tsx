import { pluralize } from './utils'
import { TIMEZONE } from '~/constants'
import type { SemesterSummary } from '~/domain/types'
import type { TrainingDetailed } from '~/services/sport/types'
import type { Day } from '~/utils/dates'
import { clockTime } from '~/utils/dates'
import { tgxFromHtml } from '~/utils/tgx-from-html'

function dateLong(date: Date): string {
  const day = date.toLocaleDateString('en-US', { weekday: 'long', timeZone: TIMEZONE })
  const month = date.toLocaleDateString('en-US', { month: 'long', timeZone: TIMEZONE })
  const dayOfMonth = date.toLocaleDateString('en-US', { day: 'numeric', timeZone: TIMEZONE })
  const year = date.toLocaleDateString('en-US', { year: 'numeric', timeZone: TIMEZONE })

  return `${day}, ${month} ${dayOfMonth}, ${year}`
}

function dateAndTimeShort(
  startsAt: Date,
  endsAt: Date,
): string {
  const weekDayShort = startsAt.toLocaleDateString('en-US', { weekday: 'short', timeZone: TIMEZONE })
  const monthShort = startsAt.toLocaleDateString('en-US', { month: 'short', timeZone: TIMEZONE })
  const dayOfMonth = startsAt.toLocaleDateString('en-US', { day: 'numeric', timeZone: TIMEZONE })

  return `${weekDayShort} ${monthShort} ${dayOfMonth}, ${clockTime(startsAt, TIMEZONE)}–${clockTime(endsAt, TIMEZONE)}`
}

function beautifulSemesterTitle(raw: string): string {
  const match = raw.toLowerCase().match(/^([sf]|sum)(\d{2})$/i)
  if (!match) {
    return raw
  }

  const [, season, year] = match
  const seasonName = season === 's' ? 'Spring' : season === 'f' ? 'Fall' : 'Summer'
  const emoji = season === 's' ? '🌷' : season === 'f' ? '🍂' : '☀️'
  const formattedYear = `20${year}`
  return `${seasonName} ${formattedYear} ${emoji}`
}

const INSPIRING_QUOTES = [
  'The only bad workout is the one that didn\'t happen.',
  'The only way to finish is to start.',
  'The only limit is the one you set yourself.',
]

export default {
  'Bot.Commands': {
    menu: 'send main menu',
    help: 'about this bot',
  },
  'Bot.Intro': 'I help Innopolis University students to track their sports progress, check-in for training classes and export personal calendar.',
  'Bot.Bio': 'Easy sports management for Innopolis University students.\n\ngithub.com/one-zero-eight/sport-bot',

  'Alerts.ButtonOutdated': '😬 This button doesn\'t work anymore. Most likely because we have released a new version of the bot. Try another way.',

  'Messages.WelcomeUnauthorized': (
    <>
      <b>Welcome to IU Sport Bot! 💪</b>
      <br />
      <br />
      I can help you check the schedule of classes, check-in for them, and track your progress.
      <br />
      <br />
      To start using the bot, please, log in with your InNoHassle account.
    </>
  ),
  'Messages.Help': (
    <>
      This bot can help you check the schedule of classes, check-in for them, and track your progress.
      <br />
      <br />
      <b>Commands:</b>
      <br />
      /menu — show main menu with actions
      <br />
      /help — show this message
      <br />
      <br />
      If you've found a bug or have a suggestion, you can open an issue in the
      {' '}
      <a href="https://github.com/one-zero-eight/sport-bot">GitHub repository</a>
      {' '}
      — contributions are welcome! If you have something to say, you can contact the maintainer: @evermake.
      <br />
      <br />
      <i>with 💜 by @one_zero_eight</i>
    </>
  ),
  'Messages.LoginRequired': 'To use the bot, you first need to log in with your InNoHassle account.',

  'Buttons.Back': '← Back',
  'Buttons.LoginWithInnohassle': 'Log in with InNoHassle',

  'HowGoodAmI.Thinking': 'Hmm... Let me think 🤔',
  'HowGoodAmI.Answer': (percent: number) => `You're better than ${percent}% of students!`,
  'HowGoodAmI.Failed': 'I don\'t know 🤷‍♂️',

  'Alert.CheckInSuccessfulText': 'Check-in successful.',
  'Alert.CheckInSuccessful': ({ title, startsAt, endsAt }: TrainingDetailed) => [
    'Check-in successful.',
    '',
    title,
    dateAndTimeShort(startsAt, endsAt),
  ].join('\n'),
  'Alert.CheckInCancelledText': 'Check-in cancelled.',
  'Alert.CheckInCancelled': ({ title, startsAt, endsAt }: TrainingDetailed) => [
    'Check-in cancelled.',
    '',
    title,
    dateAndTimeShort(startsAt, endsAt),
  ].join('\n'),
  'Alert.CheckInUnavailable': 'You cannot check-in for this training.',
  'Alert.AlreadyCheckedIn': 'You are already checked in for this training.',
  'Alert.NotCheckedIn': 'You are not checked in for this training.',
  'Alert.CheckInError': 'Error occurred during check-in.',
  'Alert.CancelCheckInError': 'Error occurred during check-in cancellation.',

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
          <b>Your progress:</b>
          <br />
          {`🎉 ${earned} ${pluralize(earned, 'hour', 'hours', 'hours')} out of ${required}${debt ? `+${debt} (debt)` : ''} 🎉`}
        </>
      )
    } else {
      return (
        <>
          <b>Your progress:</b>
          <br />
          {`${earned} ${pluralize(earned, 'hour', 'hours', 'hours')} out of ${required}${debt ? `+${debt} (debt)` : ''}`}
          <br />
          <blockquote>{INSPIRING_QUOTES[Math.floor(Math.random() * INSPIRING_QUOTES.length)]}</blockquote>
        </>
      )
    }
  },
  'Views.Main.Buttons.Refresh': '🔄 Refresh',
  'Views.Main.Buttons.TrainingsMy': '⭐️ My classes',
  'Views.Main.Buttons.TrainingsAll': '⛹️ All classes',
  'Views.Main.Buttons.Semesters': '📊 Semesters',
  'Views.Main.Buttons.Calendar': '📆 Personal calendar',
  'Views.Main.Buttons.Website': '🌐 Website',
  'Views.Main.Alerts.Refreshed': 'Refreshed!',

  'Views.Trainings.Buttons.Day': (day: Day) => {
    const dayOfWeek = day.asDate(TIMEZONE).toLocaleDateString('en-US', { weekday: 'long', timeZone: TIMEZONE })
    const month = day.asDate(TIMEZONE).toLocaleDateString('en-US', { month: 'long', timeZone: TIMEZONE })
    const dayOfMonth = day.asDate(TIMEZONE).toLocaleDateString('en-US', { day: 'numeric', timeZone: TIMEZONE })
    return `${dayOfWeek}, ${month} ${dayOfMonth}`
  },
  'Views.Trainings.Messages.AllClasses': 'Here is a list of all classes for the upcoming week:',
  'Views.Trainings.Messages.NoMyClasses': 'You have no favorite or checked-in classes for the upcoming week.',
  'Views.Trainings.Messages.MyClasses': 'Your favorite and checked-in classes for the upcoming week:',

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
      <b>Date: </b>
      {dateLong(startsAt)}
      <br />
      <b>Time: </b>
      {`${clockTime(startsAt, TIMEZONE)}–${clockTime(endsAt, TIMEZONE)}`}
      <br />
      <b>Accreditted: </b>
      {accredited ? 'Yes' : 'No'}
      <br />
      {(teachers.length > 0) && (
        <>
          <br />
          <b>Teachers:</b>
          <br />
          {teachers.map(teacher => `• ${teacher.firstName} ${teacher.lastName} (${teacher.email})\n`)}
        </>
      )}
      {(description.trim() && (
        <>
          <br />
          <b>Description:</b>
          <br />
          {tgxFromHtml(description)}
        </>
      ))}
    </>
  ),
  'Views.Training.Buttons.CheckIn': 'Check-in',
  'Views.Training.Buttons.CancelCheckIn': 'Cancel check-in',
  'Views.Training.Buttons.AddToFavorites': '⭐️ Add to favorites',
  'Views.Training.Buttons.RemoveFromFavorites': '⭐️ Remove from favorites',
  'Views.Training.Alerts.AddedToFavorites': (title: string) => `"${title}" is now a favorite.`,
  'Views.Training.Alerts.RemovedFromFavorites': (title: string) => `"${title}" is no longer a favorite.`,

  'Views.SemestersSummary.SummaryMessage': (semesters: SemesterSummary[]) => (
    <>
      <b>Semesters history</b>
      <br />
      <br />
      {semesters.map(({ title, hoursTotal, fitnessTest }) => (
        <>
          {beautifulSemesterTitle(title)}
          <br />
          {(hoursTotal != null) && (
            <>
              {`• ${hoursTotal} ${pluralize(hoursTotal, 'hour', 'hours', 'hours')}`}
              <br />
            </>
          )}
          {fitnessTest && (
            <>
              {`• Fitness test: ${fitnessTest.pointsTotal} ${pluralize(fitnessTest.pointsTotal, 'point', 'points', 'points')} (${fitnessTest.passed ? 'passed' : 'not passed'})`}
              <br />
            </>
          )}
          <br />
        </>
      ))}
    </>
  ),
}
