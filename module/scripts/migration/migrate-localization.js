/* global ui, game */

export const MigrateLocalization = async function () {
  const actorsList = game.actors
  const totalIterations = actorsList.size
  const migrationIDs = []

  // If there's nothing to go through, then just resolve and move on.
  if (totalIterations === 0) { return [] }

  // Fix localization strings (v3.0.0)
  for (const actor of actorsList) {
    const actorData = actor.system

    // Check if there are any instances of VTM5E in the actor data
    if (countInstances(actorData, 'VTM5E') > 0) {
      const newData = findAndReplace(actorData)

      ui.notifications.info(`Fixing actor ${actor.name}: Migrating localization data.`)
      migrationIDs.push(actor.uuid)

      // Update the actor's data with the new information
      actor.update({ system: newData })
    }
  }

  return migrationIDs

  // Function to enable us to search through the actorObject and replace
  // all instances of "VTM5E" with "WOD5E" in our migration function.
  function findAndReplace (obj) {
    if (Array.isArray(obj)) {
      return obj.map(item => findAndReplace(item))
    } else if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        obj[key] = findAndReplace(obj[key])
      }
      return obj
    } else if (typeof obj === 'string') {
      return obj.replace(/VTM5E/g, 'WOD5E')
    } else {
      return obj
    }
  }

  // Function to search through a given object and hunt all instances of "target"
  function countInstances (jsonObj, target) {
    let count = 0

    function search (obj) {
      for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          // Recursively look deeper into the JSON structure
          search(obj[key])
        } else if (typeof obj[key] === 'string') {
          // Regex to check for "target"
          const regex = new RegExp(`\\b${target}\\b`, 'g')
          const matches = obj[key].match(regex)

          // So long as there's some matches, increase the count
          if (matches !== null) {
            count += matches.length
          }
        }
      }
    }

    // Search through the JSON object and return the number of instances
    // of the "target" afterwards
    search(jsonObj)
    return count
  }
}
