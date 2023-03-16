declare global {
  // Configuration of foundry-vtt-types
  interface LenientGlobalVariableTypes {
    game: never; // disable game ready checks
    canvas: never; // disable canvas ready checks
    socket: never; // disable socket ready checks
  }
}

export {};
