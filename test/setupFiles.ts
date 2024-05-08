/* eslint-disable @typescript-eslint/no-empty-function */

import { Random, Settings } from "@supalosa/oldschool-trainer-sdk";

const nextRandom = [];
jest.mock("@supalosa/oldschool-trainer-sdk/src/sdk/ControlPanelController");
jest.mock("@supalosa/oldschool-trainer-sdk/src/sdk/MapController");
jest.mock("@supalosa/oldschool-trainer-sdk/src/sdk/XpDropController");
jest.mock("@supalosa/oldschool-trainer-sdk/src/sdk/utils/Assets");
jest.mock("@supalosa/oldschool-trainer-sdk/src/sdk/utils/SoundCache");
jest.mock("three", () => ({
  Scene: class Scene {
    public add(): void {
      return;
    }
  },
  WebGLRenderer: class WebGlRenderer {
    public render(): void {
      return;
    }
    public setSize(): void {
      return;
    }
  },
  GLTFLoader: class GLTFLoader {
    constructor() {}
    setMeshoptDecoder() {}
  },
}));
jest.spyOn(document, "getElementById").mockImplementation((elementId: string) => {
  const c = document.createElement("canvas");
  c.ariaLabel = elementId;
  return c;
});

Random.setRandom(() => {
  if (nextRandom.length > 0) {
    return nextRandom.shift();
  }
  Random.memory = (Random.memory + 13.37) % 180;
  return Math.abs(Math.sin(Random.memory * 0.0174533));
});

Settings.readFromStorage();
  