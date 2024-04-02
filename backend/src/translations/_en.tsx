import { TIMEZONE } from '~/constants'
import type { TrainingDetailed } from '~/services/sport/types'
import type { Weekday } from '~/utils/dates'
import { clockTime } from '~/utils/dates'
import { tgxFromHtml } from '~/utils/tgx-from-html'

function dateLong(date: Date): string {
  const day = date.toLocaleDateString('en-US', { weekday: 'long', timeZone: TIMEZONE })
  const month = date.toLocaleDateString('en-US', { month: 'long', timeZone: TIMEZONE })
  const dayOfMonth = date.getDate()
  const year = date.getFullYear()

  return `${day}, ${month} ${dayOfMonth}, ${year}`
}

export default {
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

  'HowGoodAmI.Thinking': 'Hmm... Let me think 🤔',
  'HowGoodAmI.Answer': (percent: number) => `You're better than ${percent}% of students!`,
  'HowGoodAmI.Failed': 'I don\'t know 🤷‍♂️',

  'Alert.CheckInSuccessful': (training: TrainingDetailed) => [
    '✅ Check-in successful',
    '',
    `${training.title} at ${training.startsAt}`,
  ].join('\n'),
  'Alert.CheckInCancelled': (training: TrainingDetailed) => [
    '❌ Check-in cancelled',
    '',
    `${training.title} at ${training.startsAt}`,
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

  'InNoHassle.LinkAccountsRequest.Message': 'To use this Telegram bot, please login to InNoHassle with your Telegram account. When you\'re done, send /start to continue!',
  'InNoHassle.LinkAccountsRequest.Button': 'Login with InNoHassle',
  'InNoHassle.LinkAccountsRequest.ForwardText': 'Link your Telegram to InNoHassle.',
}
