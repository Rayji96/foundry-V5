/* global ui, game, foundry */

export const integrateHealthEstimate = async () => {
  // Only allow the Game Master to run this script
  if (!game.user.isGM) return

  // Check if Health Estimate is running

  // If it is, check if the values are properly integrated yet

  // If not, then update them
}
