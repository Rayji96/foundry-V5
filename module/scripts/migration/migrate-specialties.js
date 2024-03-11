/* global ui, game */

export const MigrateSpecialties = async function () {
  const actorsList = game.actors
  const totalIterations = actorsList.size
  const itemsInvalidList = game.items.invalidDocumentIds
  const totalItemIterations = itemsInvalidList.size
  const migrationIDs = []

  // If there's nothing to go through, then just resolve and move on.
  if (totalIterations === 0 && totalItemIterations === 0) { return [] }

  // Delete any old specialties in the game (v4.0.0)
  if (itemsInvalidList.size > 0) {
    for (const itemID of itemsInvalidList) {
      const item = game.items.getInvalid(itemID)

      ui.notifications.info(`Fixing item ${item.name}: Deleting old specialties.`)
      migrationIDs.push(item.id)

      // Remove the item
      game.items.getInvalid(item.id).delete()
    }
  }

  // Migrate specialties to their appropriate skills (v4.0.0)
  for (const actor of actorsList) {
    // Variables
    const actorData = actor.system
    const actorInvalidItems = actor.items.invalidDocumentIds
    const actorInvalidItemsList = []

    // Check for invalid items
    if (actorInvalidItems.size > 0) {
      // Add each invalid item on the actor to the list
      for (const invalidID of actorInvalidItems) {
        actorInvalidItemsList.push(actor.items.getInvalid(invalidID))
      }

      // Check for if there's specialties that are invalid
      const invalidSpecialties = actorInvalidItemsList.filter(item => item.type === 'specialty')
      if (invalidSpecialties.length > 0) {
        ui.notifications.info(`Fixing actor ${actor.name}: Migrating specialties data.`)
        migrationIDs.push(actor.uuid)

        invalidSpecialties.map(item => {
          // Define what skill we're using
          const skill = item.system.skill.toLowerCase()

          // If 'bonuses' doesn't already exist for this skill, create it
          if (!actorData.skills[skill]) {
            actorData.skills[skill] = { bonuses: [] }
          } else if (!Object.prototype.hasOwnProperty.call(actorData.skills[skill], 'bonuses')) {
            actorData.skills[skill].bonuses = []
          }

          // Construct the 'specialty' data together
          const modifiedSpecialty = {
            source: `${item.name}`,
            value: 1,
            paths: [`skills.${skill}`],
            displayWhenInactive: true,
            activeWhen: {
              check: 'never'
            }
          }

          // Push the new specialty to the 'bonuses' array
          actorData.skills[skill].bonuses.push(modifiedSpecialty)

          // Remove the item
          actor.items.getInvalid(item._id).delete()

          return item
        })

        // Update the actor data with the new data when finished
        actor.update({ system: actorData, 'items.invalidDocumentIds': actorInvalidItems })
      }
    }
  }

  return migrationIDs
}
