import { TIMEZONE } from '~/constants'
import type { TrainingDetailed } from '~/services/sport/types'
import type { Weekday } from '~/utils/dates'
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

  return `${weekDayShort} ${monthShort} ${dayOfMonth}, ${clockTime(startsAt, TIMEZONE)}—${clockTime(endsAt, TIMEZONE)}`
}

export default {
  'WelcomeMessage.Unauthorized': 'Welcome to IU Sport Bot.\n\nPlease, login:',

  'Weekday.TwoLetters': (weekday: Weekday) => {
    switch (weekday) {
      case 'mon': return 'Mo'
      case 'tue': return 'Tu'
      case 'wed': return 'We'
      case 'thu': return 'Th'
      case 'fri': return 'Fr'
      case 'sat': return 'Sa'
      case 'sun': return 'Su'
    }
  },

  'Buttons.Back': '← Back',
  'Buttons.LoginWithInnohassle': 'Login with InNoHassle',

  'HowGoodAmI.Thinking': 'Hmm... Let me think 🤔',
  'HowGoodAmI.Answer': (percent: number) => `You're better than ${percent}% of students!`,
  'HowGoodAmI.Failed': 'I don\'t know 🤷‍♂️',

  'Alert.CheckInSuccessful': ({ title, startsAt, endsAt }: TrainingDetailed) => [
    '✅ Check-in successful ✅',
    '',
    `${title}\n${dateAndTimeShort(startsAt, endsAt)}`,
  ].join('\n'),
  'Alert.CheckInCancelled': ({ title, startsAt, endsAt }: TrainingDetailed) => [
    '❌ Check-in cancelled ❌',
    '',
    `${title}\n${dateAndTimeShort(startsAt, endsAt)}`,
  ].join('\n'),
  'Alert.CheckInUnavailable': 'You cannot check-in for this training.',
  'Alert.AlreadyCheckedIn': 'You are already checked in for this training.',
  'Alert.NotCheckedIn': 'You are not checked in for this training.',
  'Alert.CheckInError': 'Error occurred during check-in.',
  'Alert.CancelCheckInError': 'Error occurred during check-in cancellation.',

  'Views.Main.Message': 'Hi! Here is a list of actions:',
  'Views.Main.Buttons.Settings': '⚙️ Settings',
  'Views.Main.Buttons.Trainings': '⛹️ Classes',
  'Views.Main.Buttons.Semesters': '📆 Semesters',

  'Views.Settings.Message': 'A list of configurable things:',
  'Views.Settings.Buttons.Language': '🌐 Language',

  'Views.LanguageSettings.Message': 'Which flag do you like more?',

  'Views.TrainingsDaysList.Message': 'Choose the date:',

  'Views.DayTrainings.Message': 'Choose the class:',

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
      {`${clockTime(startsAt, TIMEZONE)}—${clockTime(endsAt, TIMEZONE)}`}
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
}
