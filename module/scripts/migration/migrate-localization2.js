/* global ui, game */

export const MigrateLocalization2 = async function () {
  return new Promise((resolve) => {
    const actorsList = game.actors
    const totalIterations = actorsList.size
    const migrationIDs = []
    let counter = 0

    const LocalizationComparisons = [
      {
        old: 'WOD5E.HomidName',
        new: 'WOD5E.WTA.HomidName'
      },
      {
        old: 'WOD5E.HomidTitle',
        new: 'WOD5E.WTA.HomidTitle'
      },
      {
        old: 'WOD5E.GlabroName',
        new: 'WOD5E.WTA.GlabroName'
      },
      {
        old: 'WOD5E.GlabroTitle',
        new: 'WOD5E.WTA.GlabroTitle'
      },
      {
        old: 'WOD5E.CrinosName',
        new: 'WOD5E.WTA.CrinosName'
      },
      {
        old: 'WOD5E.CrinosTitle',
        new: 'WOD5E.WTA.CrinosTitle'
      },
      {
        old: 'WOD5E.HispoName',
        new: 'WOD5E.WTA.HispoName'
      },
      {
        old: 'WOD5E.HispoTitle',
        new: 'WOD5E.WTA.HispoTitle'
      },
      {
        old: 'WOD5E.LupusName',
        new: 'WOD5E.WTA.LupusName'
      },
      {
        old: 'WOD5E.LupusTitle',
        new: 'WOD5E.WTA.LupusTitle'
      }
    ]

    // Fix localization strings (v4.0.0)
    for (const actor of actorsList) {
      const actorData = actor.system

      // Check if there are any instances of VTM5E in the actor data
      if (countInstances(actorData, LocalizationComparisons) > 0) {
        const newData = findAndReplace(actorData, LocalizationComparisons)

        ui.notifications.info(`Fixing actor ${actor.name}: Migrating localization data.`)
        migrationIDs.push(actor.uuid)

        // Update the actor's data with the new information
        actor.update({ system: newData })
      }

      // Increase the counter and continue
      counter++

      // Only resolve when we're finished going through all the actors.
      if (counter === totalIterations) {
        resolve(migrationIDs)
      }
    }

    // Function to search through the actorObject and replace
    // all found instances
    function findAndReplace(obj, comparisons) {
      if (Array.isArray(obj)) {
        return obj.map(item => findAndReplace(item, comparisons))
      } else if (typeof obj === 'object' && obj !== null) {
        for (const key in obj) {
          obj[key] = findAndReplace(obj[key], comparisons)
        }
        return obj
      } else if (typeof obj === 'string') {
        // Iterate through comparisons and replace old with new
        comparisons.forEach(({ old, new: replacement }) => {
          const regex = new RegExp(`\\b${old}\\b`, 'g')
          obj = obj.replace(regex, replacement)
        })
        return obj
      } else {
        return obj
      }
    }

    // Function to search through a given object and hunt all instances of "target"
    function countInstances(jsonObj, comparisons) {
      let count = 0;

      function search(obj) {
        for (const key in obj) {
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            // Recursively look deeper into the JSON structure
            search(obj[key]);
          } else if (typeof obj[key] === 'string') {
            // Iterate through comparisons and count matches
            comparisons.forEach(({ old }) => {
              const regex = new RegExp(`\\b${old}\\b`, 'g');
              const matches = obj[key].match(regex);

              // So long as there are matches, increase the count
              if (matches !== null) {
                count += matches.length;
              }
            });
          }
        }
      }

      // Search through the JSON object and return the number of instances
      // of the "target" afterwards
      search(jsonObj);
      return count;
    }
  })
}
