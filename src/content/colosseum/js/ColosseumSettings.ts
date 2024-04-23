"use strict";

export class ColosseumSettings {
  
  static useShields = true;
  static useSpears = true;
  static useTriple = true;
  static useGrapple = true;
  static usePhaseTransitions = true;

  static persistToStorage() {
    window.localStorage.setItem("useShields", String(ColosseumSettings.useShields));
    window.localStorage.setItem("useSpears", String(ColosseumSettings.useSpears));
    window.localStorage.setItem("useTriple", String(ColosseumSettings.useTriple));
    window.localStorage.setItem("useGrapple", String(ColosseumSettings.useGrapple));
    window.localStorage.setItem("usePhaseTransitions", String(ColosseumSettings.usePhaseTransitions));
  }

  static readFromStorage() {
    ColosseumSettings.useShields = window.localStorage.getItem("useShields") !== "false" || false;
    ColosseumSettings.useSpears = window.localStorage.getItem("useSpears") !== "false" || false;
    ColosseumSettings.useTriple = window.localStorage.getItem("useTriple") !== "false" || false;
    ColosseumSettings.useGrapple = window.localStorage.getItem("useGrapple") !== "false" || false;
    ColosseumSettings.usePhaseTransitions = window.localStorage.getItem("usePhaseTransitions") !== "false" || false;
  }
}
