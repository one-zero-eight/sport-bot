export type Exercise = {
  name: string
  result: string
  score: number
  maxScore: number
}

export type TrainingInfo = {
  id: number
  title: string
  startsAt: Date
  endsAt: Date
  groupId: number
  checkedIn: boolean
  checkInAvailable: boolean
}

export type TrainingDetailed = {
  id: number
  title: string
  startsAt: Date
  endsAt: Date
  description: string
  accredited: boolean
  checkedIn: boolean
  checkInAvailable: boolean
  groupId: number
  location: string | null
  teachers: {
    id: number
    firstName: string
    lastName: string
    email: string
  }[]
}
