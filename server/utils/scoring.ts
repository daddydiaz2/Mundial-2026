export function calculatePoints(
  predictedHome: number,
  predictedAway: number,
  actualHome: number,
  actualAway: number
): { points: number; isExact: number; isResult: number } {
  const isExact = predictedHome === actualHome && predictedAway === actualAway
  const predictedResult = Math.sign(predictedHome - predictedAway)
  const actualResult = Math.sign(actualHome - actualAway)
  const isResult = predictedResult === actualResult

  return {
    points: isExact ? 3 : isResult ? 1 : 0,
    isExact: isExact ? 1 : 0,
    isResult: isResult ? 1 : 0
  }
}
