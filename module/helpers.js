/* global Handlebars, game, TextEditor */

/**
 * Define any helpers necessary for working with Handlebars
 * @return {Promise}
 */
export const loadHelpers = async function () {
  Handlebars.registerHelper('concat', function () {
    let outStr = ''
    for (const arg in arguments) {
      if (typeof arguments[arg] !== 'object') {
        outStr += arguments[arg]
      }
    }
    return outStr
  })

  Handlebars.registerHelper('ifeq', function (a, b, options) {
    if (a === b) {
      return options.fn(this)
    }

    return options.inverse(this)
  })

  Handlebars.registerHelper('ifnoteq', function (a, b, options) {
    if (a !== b) {
      return options.fn(this)
    }

    return options.inverse(this)
  })

  Handlebars.registerHelper('or', function () {
    for (let i = 0; i < arguments.length - 1; i++) {
      if (arguments[i]) {
        return true
      }
    }

    return false
  })

  Handlebars.registerHelper('and', function (bool1, bool2) {
    return bool1 && bool2
  })

  Handlebars.registerHelper('toLowerCase', function (str) {
    return str.toLowerCase()
  })

  Handlebars.registerHelper('toUpperCaseFirstLetter', function (str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
  })

  const capitalize = (s) => {
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
  }

  Handlebars.registerHelper('splitArray', function (arr) {
    if (!Array.isArray(arr)) {
      return ''
    }

    return arr.join('; ')
  })

  Handlebars.registerHelper('generateLocalizedLabel', function (str) {
    // Lists
    const attributes = WOD5E.Attributes.getList()
    const skills = WOD5E.Skills.getList()
    const features = WOD5E.Features.getList()
    const disciplines = WOD5E.Disciplines.getList()
    const renown = WOD5E.Renown.getList()

    // Attributes
    if (attributes.find(obj => str in obj)) {
      return findLabel(attributes, str)
    }
    // Skills
    if (skills.find(obj => str in obj)) {
      return findLabel(skills, str)
    }
    // Features
    if (features.find(obj => str in obj)) {
      return findLabel(features, str)
    }
    // Disciplines
    if (disciplines.find(obj => str in obj)) {
      return findLabel(disciplines, str)
    }
    // Renown
    if (renown.find(obj => str in obj)) {
      return findLabel(renown, str)
    }

    // Return the base localization if nothing else is found
    const otherLocalizationString = str.capitalize()
    return game.i18n.localize(`WOD5E.${otherLocalizationString}`)

    // Function to actually grab the localized label
    function findLabel (list, string) {
      const stringObject = list.find(obj => string in obj)

      // Return the localized string if found
      if (stringObject) return stringObject[string].label

      // Return nothing
      return ''
    }
  })

  Handlebars.registerHelper('frenzy', function (willpowerMax, willpowerAgg, willpowerSup, humanity) {
    // Return the result of the stain, or 1 at minimum.
    const stainDice = Math.max((willpowerMax - willpowerAgg - willpowerSup) + Math.floor(humanity / 3), 1)

    return stainDice
  })

  Handlebars.registerHelper('willpower', function (willpowerMax, willpowerAgg, willpowerSup) {
    // Return the result of the willpower, or 1 at minimum.
    const willpowerDice = Math.max((willpowerMax - willpowerAgg - willpowerSup), 1)

    return willpowerDice
  })

  // TODO: there exist math helpers for handlebars
  Handlebars.registerHelper('remorse', function (humanity, stain) {
    // Return the result of the stain, or 1 at minimum.
    const remorseDice = Math.max((10 - humanity - stain), 1)

    return remorseDice
  })

  Handlebars.registerHelper('harano-test', function (harano, hauglosk) {
    const haranoDice = Math.max((harano + hauglosk), 1)

    return haranoDice
  })

  Handlebars.registerHelper('hauglosk-test', function (harano, hauglosk) {
    const haugloskDice = Math.max((harano + hauglosk), 1)

    return haugloskDice
  })

  Handlebars.registerHelper('attrIf', function (attr, value, test) {
    if (value === undefined) return ''
    return value === test ? attr : ''
  })

  Handlebars.registerHelper('visibleDisciplines', function (disciplines) {
    return Object.keys(disciplines).reduce(
      (obj, key) => {
        if (disciplines[key].visible) {
          obj[key] = disciplines[key]
        }
        return obj
      },
      {}
    )
  })

  Handlebars.registerHelper('visibleEdges', function (edges) {
    return Object.keys(edges).reduce(
      (obj, key) => {
        if (edges[key].visible) {
          obj[key] = edges[key]
        }
        return obj
      },
      {}
    )
  })

  Handlebars.registerHelper('sortAbilities', function (unordered = {}) {
    if (!game.settings.get('vtm5e', 'chatRollerSortAbilities')) {
      return unordered
    }
    return Object.keys(unordered).sort().reduce(
      (obj, key) => {
        obj[key] = unordered[key]
        return obj
      },
      {}
    )
  })

  Handlebars.registerHelper('numLoop', function (num, options) {
    let ret = ''

    for (let i = 0, j = num; i < j; i++) {
      ret = ret + options.fn(i)
    }

    return ret
  })

  Handlebars.registerHelper('getEdgeName', function (key) {
    const edges = {
      arsenal: 'WOD5E.HTR.Arsenal',
      fleet: 'WOD5E.HTR.Fleet',
      ordnance: 'WOD5E.HTR.Ordnance',
      library: 'WOD5E.HTR.Library',
      improvisedgear: 'WOD5E.HTR.ImprovisedGear',
      globalaccess: 'WOD5E.HTR.GlobalAccess',
      dronejockey: 'WOD5E.HTR.DroneJockey',
      beastwhisperer: 'WOD5E.HTR.BeastWhisperer',
      sensetheunnatural: 'WOD5E.HTR.SenseTheUnnatural',
      repeltheunnatural: 'WOD5E.HTR.RepelTheUnnatural',
      thwarttheunnatural: 'WOD5E.HTR.ThwartTheUnnatural',
      artifact: 'WOD5E.HTR.Artifact'
    }
    return edges[key]
  })

  Handlebars.registerHelper('enrichHTML', function (text) {
    return TextEditor.enrichHTML(text, { async: false })
  })
}
