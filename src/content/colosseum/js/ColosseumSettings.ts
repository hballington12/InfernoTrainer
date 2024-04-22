"use strict";

export class ColosseumSettings {
  
  static useShields = true;
  static useSpears = true;
  static useTripleShort = false;
  static useTripleLong = false;
  static useGrapple = false;

  static persistToStorage() {
    window.localStorage.setItem("useShields", String(ColosseumSettings.useShields));
    window.localStorage.setItem("useSpears", String(ColosseumSettings.useSpears));
    window.localStorage.setItem("useTripleShort", String(ColosseumSettings.useTripleShort));
    window.localStorage.setItem("useTripleLong", String(ColosseumSettings.useTripleLong));
    window.localStorage.setItem("useGrapple", String(ColosseumSettings.useGrapple));
  }

  static readFromStorage() {
    ColosseumSettings.useShields = window.localStorage.getItem("useShields") !== "false" || false;
    ColosseumSettings.useSpears = window.localStorage.getItem("useSpears") !== "false" || false;
    ColosseumSettings.useTripleShort = window.localStorage.getItem("useTripleShort") === "true" || false;
    ColosseumSettings.useTripleLong = window.localStorage.getItem("useTripleLong") === "true" || false;
    ColosseumSettings.useGrapple = window.localStorage.getItem("useGrapple") === "true" || false;
  }
}
