/* global ui, game */

export const MigrateGroupSheets = async function () {
  const invalidActorsList = game.actors.invalidDocumentIds
  const totalIterations = invalidActorsList.size
  const migrationIDs = []

  // If there's nothing to go through, then just resolve and move on.
  if (totalIterations === 0) { return [] }

  // Migrate Cell and Coterie sheets to new "Group" sheet type (v4.2.0)
  for (const id of invalidActorsList) {
    const actor = game.actors.getInvalid(id)

    // Coterie sheets
    if (actor.type === 'coterie') {
      ui.notifications.info(`Fixing actor ${actor.name}: Converting from Coterie sheet to Group sheet`)
      migrationIDs.push(actor.uuid)

      // Update the actor's data with the new information
      actor.update({ type: 'group', 'system.groupType': 'coterie' })
    } else if (actor.type === 'cell') {
      // Cell sheets
      ui.notifications.info(`Fixing actor ${actor.name}: Converting from Cell sheet to Group sheet`)
      migrationIDs.push(actor.uuid)

      // Update the actor's data with the new information
      actor.update({ type: 'group', 'system.groupType': 'cell' })
    }
  }

  return migrationIDs
}
