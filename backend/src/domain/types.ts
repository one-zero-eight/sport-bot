export type SemesterSummary = {
  title: string
  hoursTotal: number
  fitnessTest: {
    passed: boolean
    pointsTotal: number
  }
}
