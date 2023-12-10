/**
 * Define all Dice So Nice presets
 * @return {Promise}
 */
export const loadDiceSoNice = async function (dice3d) {
  dice3d.addSystem({ id: 'vtm5e', name: 'VtM5e' }, true)
  dice3d.addDicePreset({
    type: 'dv',
    labels: [
      'systems/vtm5e/assets/images/normal-fail-dsn.png',
      'systems/vtm5e/assets/images/normal-fail-dsn.png',
      'systems/vtm5e/assets/images/normal-fail-dsn.png',
      'systems/vtm5e/assets/images/normal-fail-dsn.png',
      'systems/vtm5e/assets/images/normal-fail-dsn.png',
      'systems/vtm5e/assets/images/normal-success-dsn.png',
      'systems/vtm5e/assets/images/normal-success-dsn.png',
      'systems/vtm5e/assets/images/normal-success-dsn.png',
      'systems/vtm5e/assets/images/normal-success-dsn.png',
      'systems/vtm5e/assets/images/normal-crit-dsn.png'
    ],
    bumpMaps: [
      '',
      '',
      '',
      '',
      '',
      'systems/vtm5e/assets/images/normal-success-dsn-bump.png',
      'systems/vtm5e/assets/images/normal-success-dsn-bump.png',
      'systems/vtm5e/assets/images/normal-success-dsn-bump.png',
      'systems/vtm5e/assets/images/normal-success-dsn-bump.png',
      'systems/vtm5e/assets/images/normal-crit-dsn-bump.png'
    ],
    colorset: 'black',
    system: 'vtm5e'
  })

  dice3d.addColorset({
    name: 'hunger',
    description: 'V5 Hunger Dice',
    category: 'V5',
    foreground: '#fff',
    background: '#6e0000',
    texture: 'none',
    edge: '#6e0000',
    material: 'plastic',
    font: 'Arial Black',
    fontScale: {
      d6: 1.1,
      df: 2.2,
      dv: 0.8,
      dg: 0.8
    }
  }, 'default')

  dice3d.addDicePreset({
    type: 'dg',
    labels: [
      'systems/vtm5e/assets/images/bestial-fail-dsn.png',
      'systems/vtm5e/assets/images/red-fail-dsn.png',
      'systems/vtm5e/assets/images/red-fail-dsn.png',
      'systems/vtm5e/assets/images/red-fail-dsn.png',
      'systems/vtm5e/assets/images/red-fail-dsn.png',
      'systems/vtm5e/assets/images/red-success-dsn.png',
      'systems/vtm5e/assets/images/red-success-dsn.png',
      'systems/vtm5e/assets/images/red-success-dsn.png',
      'systems/vtm5e/assets/images/red-success-dsn.png',
      'systems/vtm5e/assets/images/red-crit-dsn.png'
    ],
    bumpMaps: [
      'systems/vtm5e/assets/images/bestial-fail-dsn-bump.png',
      '',
      '',
      '',
      '',
      'systems/vtm5e/assets/images/normal-success-dsn-bump.png',
      'systems/vtm5e/assets/images/normal-success-dsn-bump.png',
      'systems/vtm5e/assets/images/normal-success-dsn-bump.png',
      'systems/vtm5e/assets/images/normal-success-dsn-bump.png',
      'systems/vtm5e/assets/images/red-crit-dsn-bump.png'
    ],
    colorset: 'hunger',
    system: 'vtm5e'
  })

  dice3d.addDicePreset({
    type: 'dh',
    labels: [
      'systems/vtm5e/assets/images/normal-fail-dsn.png',
      'systems/vtm5e/assets/images/normal-fail-dsn.png',
      'systems/vtm5e/assets/images/normal-fail-dsn.png',
      'systems/vtm5e/assets/images/normal-fail-dsn.png',
      'systems/vtm5e/assets/images/normal-fail-dsn.png',
      'systems/vtm5e/assets/images/hunter-normal-success-dsn.png',
      'systems/vtm5e/assets/images/hunter-normal-success-dsn.png',
      'systems/vtm5e/assets/images/hunter-normal-success-dsn.png',
      'systems/vtm5e/assets/images/hunter-normal-success-dsn.png',
      'systems/vtm5e/assets/images/hunter-normal-crit-dsn.png'
    ],
    bumpMaps: [
      '',
      '',
      '',
      '',
      '',
      'systems/vtm5e/assets/images/hunter-normal-success-dsn.png',
      'systems/vtm5e/assets/images/hunter-normal-success-dsn.png',
      'systems/vtm5e/assets/images/hunter-normal-success-dsn.png',
      'systems/vtm5e/assets/images/hunter-normal-success-dsn.png',
      'systems/vtm5e/assets/images/hunter-normal-crit-dsn.png'
    ],
    colorset: 'hunterdice',
    system: 'vtm5e'
  })

  dice3d.addColorset({
    name: 'hunterdice',
    description: 'Hunter Dice',
    category: 'V5',
    foreground: '#000000',
    background: '#cb650f',
    texture: 'none',
    edge: '#cb650f',
    material: 'plastic',
    font: 'Arial Black',
    fontScale: {
      d6: 1.1,
      df: 2.2,
      dv: 0.8,
      dg: 0.8,
      dh: 0.7
    }
  }, 'default')

  dice3d.addColorset({
    name: 'desperation',
    description: 'Desperation Dice',
    category: 'V5',
    foreground: '#fff',
    background: '#ee7e1f',
    texture: 'none',
    edge: '#ee7e1f',
    material: 'plastic',
    font: 'Arial Black',
    fontScale: {
      d6: 1.1,
      df: 2.5,
      dv: 0.8,
      dg: 0.8,
      dh: 0.7
    }
  }, 'default')

  dice3d.addDicePreset({
    type: 'ds',
    labels: [
      'systems/vtm5e/assets/images/desperation-fail-dsnc.png',
      'systems/vtm5e/assets/images/red-fail-dsn.png',
      'systems/vtm5e/assets/images/red-fail-dsn.png',
      'systems/vtm5e/assets/images/red-fail-dsn.png',
      'systems/vtm5e/assets/images/red-fail-dsn.png',
      'systems/vtm5e/assets/images/hunter-normal-success-dsnc.png',
      'systems/vtm5e/assets/images/hunter-normal-success-dsnc.png',
      'systems/vtm5e/assets/images/hunter-normal-success-dsnc.png',
      'systems/vtm5e/assets/images/hunter-normal-success-dsnc.png',
      'systems/vtm5e/assets/images/hunter-normal-crit-dsnc.png'
    ],
    bumpMaps: [
      'systems/vtm5e/assets/images/desperation-fail-dsn-bump.png',
      '',
      '',
      '',
      '',
      'systems/vtm5e/assets/images/hunter-normal-success-dsn.png',
      'systems/vtm5e/assets/images/hunter-normal-success-dsn.png',
      'systems/vtm5e/assets/images/hunter-normal-success-dsn.png',
      'systems/vtm5e/assets/images/hunter-normal-success-dsn.png',
      'systems/vtm5e/assets/images/hunter-normal-crit-dsn.png'
    ],
    colorset: 'black',
    system: 'vtm5e'
  })

  dice3d.addDicePreset({
    type: 'dw',
    labels: [
      'systems/vtm5e/assets/images/normal-fail-dsn.png',
      'systems/vtm5e/assets/images/normal-fail-dsn.png',
      'systems/vtm5e/assets/images/normal-fail-dsn.png',
      'systems/vtm5e/assets/images/normal-fail-dsn.png',
      'systems/vtm5e/assets/images/normal-fail-dsn.png',
      'systems/vtm5e/assets/images/werewolf-success-dsn.png',
      'systems/vtm5e/assets/images/werewolf-success-dsn.png',
      'systems/vtm5e/assets/images/werewolf-success-dsn.png',
      'systems/vtm5e/assets/images/werewolf-success-dsn.png',
      'systems/vtm5e/assets/images/werewolf-crit-dsn.png'
    ],
    bumpMaps: [
      '',
      '',
      '',
      '',
      '',
      'systems/vtm5e/assets/images/werewolf-success-dsn-bump.png',
      'systems/vtm5e/assets/images/werewolf-success-dsn-bump.png',
      'systems/vtm5e/assets/images/werewolf-success-dsn-bump.png',
      'systems/vtm5e/assets/images/werewolf-success-dsn-bump.png',
      'systems/vtm5e/assets/images/werewolf-crit-dsn-bump.png'
    ],
    colorset: 'werewolf',
    system: 'vtm5e'
  })

  dice3d.addDicePreset({
    type: 'dr',
    labels: [
      'systems/vtm5e/assets/images/werewolf-brutal-fail-dsn.png',
      'systems/vtm5e/assets/images/werewolf-brutal-fail-dsn.png',
      'systems/vtm5e/assets/images/normal-fail-dsn.png',
      'systems/vtm5e/assets/images/normal-fail-dsn.png',
      'systems/vtm5e/assets/images/normal-fail-dsn.png',
      'systems/vtm5e/assets/images/werewolf-success-dsn.png',
      'systems/vtm5e/assets/images/werewolf-success-dsn.png',
      'systems/vtm5e/assets/images/werewolf-success-dsn.png',
      'systems/vtm5e/assets/images/werewolf-success-dsn.png',
      'systems/vtm5e/assets/images/werewolf-crit-dsn.png'
    ],
    bumpMaps: [
      'systems/vtm5e/assets/images/werewolf-brutal-fail-dsn-bump.png',
      'systems/vtm5e/assets/images/werewolf-brutal-fail-dsn-bump.png',
      '',
      '',
      '',
      'systems/vtm5e/assets/images/werewolf-success-dsn-bump.png',
      'systems/vtm5e/assets/images/werewolf-success-dsn-bump.png',
      'systems/vtm5e/assets/images/werewolf-success-dsn-bump.png',
      'systems/vtm5e/assets/images/werewolf-success-dsn-bump.png',
      'systems/vtm5e/assets/images/werewolf-crit-dsn-bump.png'
    ],
    colorset: 'rage',
    system: 'vtm5e'
  })

  dice3d.addColorset({
    name: 'werewolf',
    description: 'Werewolf Dice',
    category: 'V5',
    foreground: '#000000',
    background: '#4a5115',
    texture: 'none',
    edge: '#4a5115',
    material: 'plastic',
    font: 'Arial Black'
  }, 'default')

  dice3d.addColorset({
    name: 'rage',
    description: 'Rage Dice',
    category: 'V5',
    foreground: '#000000',
    background: '#820900',
    texture: 'none',
    edge: '#820900',
    material: 'plastic',
    font: 'Arial Black'
  }, 'default')

  dice3d.addSystem({ id: 'vtm5x', name: 'VtM5e Custom' }, true)
  dice3d.addDicePreset({
    type: 'dv',
    labels: [
      'systems/vtm5e/assets/images/normal-fail-dsn.png',
      'systems/vtm5e/assets/images/normal-fail-dsn.png',
      'systems/vtm5e/assets/images/normal-fail-dsn.png',
      'systems/vtm5e/assets/images/normal-fail-dsn.png',
      'systems/vtm5e/assets/images/normal-fail-dsn.png',
      'systems/vtm5e/assets/images/normal-success-dsn.png',
      'systems/vtm5e/assets/images/normal-success-dsn.png',
      'systems/vtm5e/assets/images/normal-success-dsn.png',
      'systems/vtm5e/assets/images/normal-success-dsn.png',
      'systems/vtm5e/assets/images/normal-crit-dsn.png'
    ],
    bumpMaps: [
      '',
      '',
      '',
      '',
      '',
      'systems/vtm5e/assets/images/normal-success-dsn-bump.png',
      'systems/vtm5e/assets/images/normal-success-dsn-bump.png',
      'systems/vtm5e/assets/images/normal-success-dsn-bump.png',
      'systems/vtm5e/assets/images/normal-success-dsn-bump.png',
      'systems/vtm5e/assets/images/normal-crit-dsn-bump.png'
    ],
    system: 'vtm5x'
  })

  dice3d.addDicePreset({
    type: 'dg',
    labels: [
      'systems/vtm5e/assets/images/bestial-fail-dsn.png',
      'systems/vtm5e/assets/images/red-fail-dsn.png',
      'systems/vtm5e/assets/images/red-fail-dsn.png',
      'systems/vtm5e/assets/images/red-fail-dsn.png',
      'systems/vtm5e/assets/images/red-fail-dsn.png',
      'systems/vtm5e/assets/images/red-success-dsn.png',
      'systems/vtm5e/assets/images/red-success-dsn.png',
      'systems/vtm5e/assets/images/red-success-dsn.png',
      'systems/vtm5e/assets/images/red-success-dsn.png',
      'systems/vtm5e/assets/images/red-crit-dsn.png'
    ],
    bumpMaps: [
      'systems/vtm5e/assets/images/bestial-fail-dsn-bump.png',
      '',
      '',
      '',
      '',
      'systems/vtm5e/assets/images/normal-success-dsn-bump.png',
      'systems/vtm5e/assets/images/normal-success-dsn-bump.png',
      'systems/vtm5e/assets/images/normal-success-dsn-bump.png',
      'systems/vtm5e/assets/images/normal-success-dsn-bump.png',
      'systems/vtm5e/assets/images/red-crit-dsn-bump.png'
    ],
    system: 'vtm5x'
  })

  dice3d.addDicePreset({
    type: 'dh',
    labels: [
      'systems/vtm5e/assets/images/normal-fail-dsn.png',
      'systems/vtm5e/assets/images/normal-fail-dsn.png',
      'systems/vtm5e/assets/images/normal-fail-dsn.png',
      'systems/vtm5e/assets/images/normal-fail-dsn.png',
      'systems/vtm5e/assets/images/normal-fail-dsn.png',
      'systems/vtm5e/assets/images/hunter-normal-success-dsn.png',
      'systems/vtm5e/assets/images/hunter-normal-success-dsn.png',
      'systems/vtm5e/assets/images/hunter-normal-success-dsn.png',
      'systems/vtm5e/assets/images/hunter-normal-success-dsn.png',
      'systems/vtm5e/assets/images/hunter-normal-crit-dsn.png'
    ],
    bumpMaps: [
      '',
      '',
      '',
      '',
      '',
      'systems/vtm5e/assets/images/hunter-normal-success-dsn.png',
      'systems/vtm5e/assets/images/hunter-normal-success-dsn.png',
      'systems/vtm5e/assets/images/hunter-normal-success-dsn.png',
      'systems/vtm5e/assets/images/hunter-normal-success-dsn.png',
      'systems/vtm5e/assets/images/hunter-normal-crit-dsn.png'
    ],
    system: 'vtm5x'
  })

  dice3d.addDicePreset({
    type: 'ds',
    labels: [
      'systems/vtm5e/assets/images/desperation-fail-dsnc.png',
      'systems/vtm5e/assets/images/red-fail-dsn.png',
      'systems/vtm5e/assets/images/red-fail-dsn.png',
      'systems/vtm5e/assets/images/red-fail-dsn.png',
      'systems/vtm5e/assets/images/red-fail-dsn.png',
      'systems/vtm5e/assets/images/hunter-normal-success-dsnc.png',
      'systems/vtm5e/assets/images/hunter-normal-success-dsnc.png',
      'systems/vtm5e/assets/images/hunter-normal-success-dsnc.png',
      'systems/vtm5e/assets/images/hunter-normal-success-dsnc.png',
      'systems/vtm5e/assets/images/hunter-normal-crit-dsnc.png'
    ],
    bumpMaps: [
      'systems/vtm5e/assets/images/desperation-fail-dsn-bump.png',
      '',
      '',
      '',
      '',
      'systems/vtm5e/assets/images/hunter-normal-success-dsn.png',
      'systems/vtm5e/assets/images/hunter-normal-success-dsn.png',
      'systems/vtm5e/assets/images/hunter-normal-success-dsn.png',
      'systems/vtm5e/assets/images/hunter-normal-success-dsn.png',
      'systems/vtm5e/assets/images/hunter-normal-crit-dsn.png'
    ],
    system: 'vtm5x'
  })

  dice3d.addDicePreset({
    type: 'dw',
    labels: [
      'systems/vtm5e/assets/images/normal-fail-dsn.png',
      'systems/vtm5e/assets/images/normal-fail-dsn.png',
      'systems/vtm5e/assets/images/normal-fail-dsn.png',
      'systems/vtm5e/assets/images/normal-fail-dsn.png',
      'systems/vtm5e/assets/images/normal-fail-dsn.png',
      'systems/vtm5e/assets/images/werewolf-success-dsn.png',
      'systems/vtm5e/assets/images/werewolf-success-dsn.png',
      'systems/vtm5e/assets/images/werewolf-success-dsn.png',
      'systems/vtm5e/assets/images/werewolf-success-dsn.png',
      'systems/vtm5e/assets/images/werewolf-crit-dsn.png'
    ],
    bumpMaps: [
      '',
      '',
      '',
      '',
      '',
      'systems/vtm5e/assets/images/werewolf-success-dsn-bump.png',
      'systems/vtm5e/assets/images/werewolf-success-dsn-bump.png',
      'systems/vtm5e/assets/images/werewolf-success-dsn-bump.png',
      'systems/vtm5e/assets/images/werewolf-success-dsn-bump.png',
      'systems/vtm5e/assets/images/werewolf-crit-dsn-bump.png'
    ],
    system: 'vtm5x'
  })

  dice3d.addDicePreset({
    type: 'dr',
    labels: [
      'systems/vtm5e/assets/images/werewolf-brutal-fail-dsn.png',
      'systems/vtm5e/assets/images/werewolf-brutal-fail-dsn.png',
      'systems/vtm5e/assets/images/normal-fail-dsn.png',
      'systems/vtm5e/assets/images/normal-fail-dsn.png',
      'systems/vtm5e/assets/images/normal-fail-dsn.png',
      'systems/vtm5e/assets/images/werewolf-success-dsn.png',
      'systems/vtm5e/assets/images/werewolf-success-dsn.png',
      'systems/vtm5e/assets/images/werewolf-success-dsn.png',
      'systems/vtm5e/assets/images/werewolf-success-dsn.png',
      'systems/vtm5e/assets/images/werewolf-crit-dsn.png'
    ],
    bumpMaps: [
      'systems/vtm5e/assets/images/werewolf-brutal-fail-dsn-bump.png',
      'systems/vtm5e/assets/images/werewolf-brutal-fail-dsn-bump.png',
      '',
      '',
      '',
      'systems/vtm5e/assets/images/werewolf-success-dsn-bump.png',
      'systems/vtm5e/assets/images/werewolf-success-dsn-bump.png',
      'systems/vtm5e/assets/images/werewolf-success-dsn-bump.png',
      'systems/vtm5e/assets/images/werewolf-success-dsn-bump.png',
      'systems/vtm5e/assets/images/werewolf-crit-dsn-bump.png'
    ],
    system: 'vtm5x'
  })

  dice3d.addSystem({ id: 'vtm5y', name: 'VtM5e Colors' }, true)
  dice3d.addDicePreset({
    type: 'dv',
    labels: [
      'systems/vtm5e/assets/images/normal-fail-dsn.png',
      'systems/vtm5e/assets/images/normal-fail-dsn.png',
      'systems/vtm5e/assets/images/normal-fail-dsn.png',
      'systems/vtm5e/assets/images/normal-fail-dsn.png',
      'systems/vtm5e/assets/images/normal-fail-dsn.png',
      'systems/vtm5e/assets/images/normal-success-dsn.png',
      'systems/vtm5e/assets/images/normal-success-dsn.png',
      'systems/vtm5e/assets/images/normal-success-dsn.png',
      'systems/vtm5e/assets/images/normal-success-dsn.png',
      'systems/vtm5e/assets/images/normal-crit-dsn.png'
    ],
    bumpMaps: [
      '',
      '',
      '',
      '',
      '',
      'systems/vtm5e/assets/images/normal-success-dsn-bump.png',
      'systems/vtm5e/assets/images/normal-success-dsn-bump.png',
      'systems/vtm5e/assets/images/normal-success-dsn-bump.png',
      'systems/vtm5e/assets/images/normal-success-dsn-bump.png',
      'systems/vtm5e/assets/images/normal-crit-dsn-bump.png'
    ],
    system: 'vtm5y'
  })

  dice3d.addDicePreset({
    type: 'dg',
    labels: [
      'systems/vtm5e/assets/images/bestial-fail-dsnc.png',
      'systems/vtm5e/assets/images/red-fail-dsn.png',
      'systems/vtm5e/assets/images/red-fail-dsn.png',
      'systems/vtm5e/assets/images/red-fail-dsn.png',
      'systems/vtm5e/assets/images/red-fail-dsn.png',
      'systems/vtm5e/assets/images/red-success-dsnc.png',
      'systems/vtm5e/assets/images/red-success-dsnc.png',
      'systems/vtm5e/assets/images/red-success-dsnc.png',
      'systems/vtm5e/assets/images/red-success-dsnc.png',
      'systems/vtm5e/assets/images/red-crit-dsnc.png'
    ],
    bumpMaps: [
      'systems/vtm5e/assets/images/bestial-fail-dsn-bump.png',
      '',
      '',
      '',
      '',
      'systems/vtm5e/assets/images/normal-success-dsn-bump.png',
      'systems/vtm5e/assets/images/normal-success-dsn-bump.png',
      'systems/vtm5e/assets/images/normal-success-dsn-bump.png',
      'systems/vtm5e/assets/images/normal-success-dsn-bump.png',
      'systems/vtm5e/assets/images/red-crit-dsn-bump.png'
    ],
    system: 'vtm5y'
  })

  dice3d.addDicePreset({
    type: 'dh',
    labels: [
      'systems/vtm5e/assets/images/normal-fail-dsn.png',
      'systems/vtm5e/assets/images/normal-fail-dsn.png',
      'systems/vtm5e/assets/images/normal-fail-dsn.png',
      'systems/vtm5e/assets/images/normal-fail-dsn.png',
      'systems/vtm5e/assets/images/normal-fail-dsn.png',
      'systems/vtm5e/assets/images/hunter-normal-success-dsn.png',
      'systems/vtm5e/assets/images/hunter-normal-success-dsn.png',
      'systems/vtm5e/assets/images/hunter-normal-success-dsn.png',
      'systems/vtm5e/assets/images/hunter-normal-success-dsn.png',
      'systems/vtm5e/assets/images/hunter-normal-crit-dsn.png'
    ],
    bumpMaps: [
      '',
      '',
      '',
      '',
      '',
      'systems/vtm5e/assets/images/hunter-normal-success-dsn.png',
      'systems/vtm5e/assets/images/hunter-normal-success-dsn.png',
      'systems/vtm5e/assets/images/hunter-normal-success-dsn.png',
      'systems/vtm5e/assets/images/hunter-normal-success-dsn.png',
      'systems/vtm5e/assets/images/hunter-normal-crit-dsn.png'
    ],
    system: 'vtm5y'
  })

  dice3d.addDicePreset({
    type: 'ds',
    labels: [
      'systems/vtm5e/assets/images/desperation-fail-dsnc.png',
      'systems/vtm5e/assets/images/red-fail-dsn.png',
      'systems/vtm5e/assets/images/red-fail-dsn.png',
      'systems/vtm5e/assets/images/red-fail-dsn.png',
      'systems/vtm5e/assets/images/red-fail-dsn.png',
      'systems/vtm5e/assets/images/hunter-normal-success-dsnc.png',
      'systems/vtm5e/assets/images/hunter-normal-success-dsnc.png',
      'systems/vtm5e/assets/images/hunter-normal-success-dsnc.png',
      'systems/vtm5e/assets/images/hunter-normal-success-dsnc.png',
      'systems/vtm5e/assets/images/hunter-normal-crit-dsnc.png'
    ],
    bumpMaps: [
      'systems/vtm5e/assets/images/desperation-fail-dsn-bump.png',
      '',
      '',
      '',
      '',
      'systems/vtm5e/assets/images/hunter-normal-success-dsn.png',
      'systems/vtm5e/assets/images/hunter-normal-success-dsn.png',
      'systems/vtm5e/assets/images/hunter-normal-success-dsn.png',
      'systems/vtm5e/assets/images/hunter-normal-success-dsn.png',
      'systems/vtm5e/assets/images/hunter-normal-crit-dsn.png'
    ],
    system: 'vtm5y'
  })
}
