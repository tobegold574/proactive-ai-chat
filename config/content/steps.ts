export type StepId = "start" | "customize"

export const steps: { id: StepId; number: string }[] = [
  { id: "start", number: "01" },
  { id: "customize", number: "02" },
]
