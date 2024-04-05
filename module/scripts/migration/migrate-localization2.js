/* global ui, game */

export const MigrateLocalization2 = async function () {
  const actorsList = game.actors
  const totalIterations = actorsList.size
  const migrationIDs = []

  // If there's nothing to go through, then just resolve and move on.
  if (totalIterations === 0) { return [] }

  const LocalizationComparisons = [
    // Vampire updates
    {
      old: 'WOD5E.Animalism',
      new: 'WOD5E.VTM.Animalism'
    },
    {
      old: 'WOD5E.Auspex',
      new: 'WOD5E.VTM.Auspex'
    },
    {
      old: 'WOD5E.Celerity',
      new: 'WOD5E.VTM.Celerity'
    },
    {
      old: 'WOD5E.Dominate',
      new: 'WOD5E.VTM.Dominate'
    },
    {
      old: 'WOD5E.Fortitude',
      new: 'WOD5E.VTM.Fortitude'
    },
    {
      old: 'WOD5E.Obfuscate',
      new: 'WOD5E.VTM.Obfuscate'
    },
    {
      old: 'WOD5E.Potence',
      new: 'WOD5E.VTM.Potence'
    },
    {
      old: 'WOD5E.Presence',
      new: 'WOD5E.VTM.Presence'
    },
    {
      old: 'WOD5E.Protean',
      new: 'WOD5E.VTM.Protean'
    },
    {
      old: 'WOD5E.BloodSorcery',
      new: 'WOD5E.VTM.BloodSorcery'
    },
    {
      old: 'WOD5E.Oblivion',
      new: 'WOD5E.VTM.Oblivion'
    },
    {
      old: 'WOD5E.ThinBloodAlchemy',
      new: 'WOD5E.VTM.ThinBloodAlchemy'
    },
    {
      old: 'WOD5E.Rituals',
      new: 'WOD5E.VTM.Rituals'
    },
    {
      old: 'WOD5E.Ceremonies',
      new: 'WOD5E.VTM.Ceremonies'
    },

    // Hunter updates
    {
      old: 'WOD5E.Arsenal',
      new: 'WOD5E.HTR.Arsenal'
    },
    {
      old: 'WOD5E.Artifact',
      new: 'WOD5E.HTR.Artifact'
    },
    {
      old: 'WOD5E.Fleet',
      new: 'WOD5E.HTR.Fleet'
    },
    {
      old: 'WOD5E.Ordnance',
      new: 'WOD5E.HTR.Ordnance'
    },
    {
      old: 'WOD5E.Library',
      new: 'WOD5E.HTR.Library'
    },
    {
      old: 'WOD5E.ImprovisedGear',
      new: 'WOD5E.HTR.ImprovisedGear'
    },
    {
      old: 'WOD5E.GlobalAccess',
      new: 'WOD5E.HTR.GlobalAccess'
    },
    {
      old: 'WOD5E.DroneJockey',
      new: 'WOD5E.HTR.DroneJockey'
    },
    {
      old: 'WOD5E.BeastWhisperer',
      new: 'WOD5E.HTR.BeastWhisperer'
    },
    {
      old: 'WOD5E.SenseTheUnnatural',
      new: 'WOD5E.HTR.SenseTheUnnatural'
    },
    {
      old: 'WOD5E.RepelTheUnnatural',
      new: 'WOD5E.HTR.RepelTheUnnatural'
    },
    {
      old: 'WOD5E.ThwartTheUnnatural',
      new: 'WOD5E.HTR.ThwartTheUnnatural'
    },

    // Werewolf updates
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
    },
    {
      old: 'WOD5E.Native',
      new: 'WOD5E.WTA.Native'
    },
    {
      old: 'WOD5E.Ragabash',
      new: 'WOD5E.WTA.Ragabash'
    },
    {
      old: 'WOD5E.Theurge',
      new: 'WOD5E.WTA.Theurge'
    },
    {
      old: 'WOD5E.Philodox',
      new: 'WOD5E.WTA.Philodox'
    },
    {
      old: 'WOD5E.Galliard',
      new: 'WOD5E.WTA.Galliard'
    },
    {
      old: 'WOD5E.Ahroun',
      new: 'WOD5E.WTA.Ahroun'
    },
    {
      old: 'WOD5E.BlackFury',
      new: 'WOD5E.WTA.BlackFury'
    },
    {
      old: 'WOD5E.BoneGnawer',
      new: 'WOD5E.WTA.BoneGnawer'
    },
    {
      old: 'WOD5E.ChildrenOfGaia',
      new: 'WOD5E.WTA.ChildrenOfGaia'
    },
    {
      old: 'WOD5E.Galestalker',
      new: 'WOD5E.WTA.Galestalker'
    },
    {
      old: 'WOD5E.GhostCouncil',
      new: 'WOD5E.WTA.GhostCouncil'
    },
    {
      old: 'WOD5E.GlassWalker',
      new: 'WOD5E.WTA.GlassWalker'
    },
    {
      old: 'WOD5E.HartWarden',
      new: 'WOD5E.WTA.HartWarden'
    },
    {
      old: 'WOD5E.RedTalon',
      new: 'WOD5E.WTA.RedTalon'
    },
    {
      old: 'WOD5E.ShadowLord',
      new: 'WOD5E.WTA.ShadowLord'
    },
    {
      old: 'WOD5E.SilentStrider',
      new: 'WOD5E.WTA.SilentStrider'
    },
    {
      old: 'WOD5E.SilverFang',
      new: 'WOD5E.WTA.SilverFang'
    }
  ]

  // Fix localization strings (v4.0.0)
  for (const actor of actorsList) {
    const actorData = actor.system

    // Check if there are any instances of any of the localization comparisons in the actor data
    if (countInstances(actorData, LocalizationComparisons) > 0) {
      const newData = findAndReplace(actorData, LocalizationComparisons)

      ui.notifications.info(`Fixing actor ${actor.name}: Migrating localization data.`)
      migrationIDs.push(actor.uuid)

      // Update the actor's data with the new information
      actor.update({ system: newData })
    }
  }

  return migrationIDs

  // Function to search through the actorObject and replace
  // all found instances
  function findAndReplace (obj, comparisons) {
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
  function countInstances (jsonObj, comparisons) {
    let count = 0

    function search (obj) {
      for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          // Recursively look deeper into the JSON structure
          search(obj[key])
        } else if (typeof obj[key] === 'string') {
          // Iterate through comparisons and count matches
          comparisons.forEach(({ old }) => {
            const regex = new RegExp(`\\b${old}\\b`, 'g')
            const matches = obj[key].match(regex)

            // So long as there are matches, increase the count
            if (matches !== null) {
              count += matches.length
            }
          })
        }
      }
    }

    // Search through the JSON object and return the number of instances
    // of the "target" afterwards
    search(jsonObj)
    return count
  }
}
