"use strict";

import { InfernoRegion } from "./content/inferno/js/InfernoRegion";
import { World as World } from "./sdk/World";
import { Settings } from "./sdk/Settings";
import { ImageLoader } from "./sdk/utils/ImageLoader";
import NewRelicBrowser from "new-relic-browser";
import { Viewport } from "./sdk/Viewport";
import { filter } from "lodash";
import { InvisibleMovementBlocker } from "./content/MovementBlocker";
import { TileMarker } from "./content/TileMarker";
import { EntityName } from "./sdk/EntityName";
import { Mob } from "./sdk/Mob";
import { Location } from "./sdk/Location";
import { MapController } from "./sdk/MapController";
import { Assets } from "./sdk/utils/Assets";
import { Chrome } from "./sdk/Chrome";

import SpecialAttackBarBackground from "./assets/images/attackstyles/interface/special_attack_background.png";
import { InfernoScene } from "./content/InfernoScene";
import { Region } from "./sdk/Region";

declare global {
  interface Window {
    newrelic: typeof NewRelicBrowser;
  }
}

Settings.readFromStorage();

const selectedRegion: Region = new InfernoRegion();

// Create world
const world = new World();
world.getReadyTimer = 6;
selectedRegion.world = world;
world.addRegion(selectedRegion);

const { player } = selectedRegion.initialiseRegion();

Viewport.setupViewport(selectedRegion);
Viewport.viewport.setPlayer(player);

ImageLoader.onAllImagesLoaded(() => {
  MapController.controller.updateOrbsMask(player.currentStats, player.stats);
});
for (let x = 10; x < 41; x++) {
  selectedRegion.addEntity(new InvisibleMovementBlocker(this, { x, y: 13 }));
  selectedRegion.addEntity(new InvisibleMovementBlocker(this, { x, y: 44 }));
}
for (let y = 14; y < 44; y++) {
  selectedRegion.addEntity(new InvisibleMovementBlocker(this, { x: 10, y }));
  selectedRegion.addEntity(new InvisibleMovementBlocker(this, { x: 40, y }));
}
const waveInput: HTMLInputElement = document.getElementById("waveinput") as HTMLInputElement;

const exportWaveInput: HTMLButtonElement = document.getElementById("exportCustomWave") as HTMLButtonElement;
const editWaveInput: HTMLButtonElement = document.getElementById("editWave") as HTMLButtonElement;

editWaveInput.addEventListener("click", () => {
  const magers = filter(selectedRegion.mobs, (mob: Mob) => {
    return mob.mobName() === EntityName.JAL_ZEK;
  }).map((mob: Mob) => {
    return [mob.location.x - 11, mob.location.y - 14];
  });

  const rangers = filter(selectedRegion.mobs, (mob: Mob) => {
    return mob.mobName() === EntityName.JAL_XIL;
  }).map((mob: Mob) => {
    return [mob.location.x - 11, mob.location.y - 14];
  });

  const meleers = filter(selectedRegion.mobs, (mob: Mob) => {
    return mob.mobName() === EntityName.JAL_IM_KOT;
  }).map((mob: Mob) => {
    return [mob.location.x - 11, mob.location.y - 14];
  });

  const blobs = filter(selectedRegion.mobs, (mob: Mob) => {
    return mob.mobName() === EntityName.JAL_AK;
  }).map((mob: Mob) => {
    return [mob.location.x - 11, mob.location.y - 14];
  });

  const bats = filter(selectedRegion.mobs, (mob: Mob) => {
    return mob.mobName() === EntityName.JAL_MEJ_RAJ;
  }).map((mob: Mob) => {
    return [mob.location.x - 11, mob.location.y - 14];
  });

  const url = `/?wave=0&mager=${JSON.stringify(magers)}&ranger=${JSON.stringify(
    rangers,
  )}&melee=${JSON.stringify(meleers)}&blob=${JSON.stringify(blobs)}&bat=${JSON.stringify(bats)}&copyable`;
  window.location.href = url;
});
exportWaveInput.addEventListener("click", () => {
  const magers = filter(selectedRegion.mobs, (mob: Mob) => {
    return mob.mobName() === EntityName.JAL_ZEK;
  }).map((mob: Mob) => {
    return [mob.location.x - 11, mob.location.y - 14];
  });

  const rangers = filter(selectedRegion.mobs, (mob: Mob) => {
    return mob.mobName() === EntityName.JAL_XIL;
  }).map((mob: Mob) => {
    return [mob.location.x - 11, mob.location.y - 14];
  });

  const meleers = filter(selectedRegion.mobs, (mob: Mob) => {
    return mob.mobName() === EntityName.JAL_IM_KOT;
  }).map((mob: Mob) => {
    return [mob.location.x - 11, mob.location.y - 14];
  });

  const blobs = filter(selectedRegion.mobs, (mob: Mob) => {
    return mob.mobName() === EntityName.JAL_AK;
  }).map((mob: Mob) => {
    return [mob.location.x - 11, mob.location.y - 14];
  });

  const bats = filter(selectedRegion.mobs, (mob: Mob) => {
    return mob.mobName() === EntityName.JAL_MEJ_RAJ;
  }).map((mob: Mob) => {
    return [mob.location.x - 11, mob.location.y - 14];
  });

  const url = `/?wave=74&mager=${JSON.stringify(magers)}&ranger=${JSON.stringify(rangers)}&melee=${JSON.stringify(
    meleers,
  )}&blob=${JSON.stringify(blobs)}&bat=${JSON.stringify(bats)}&copyable`;
  window.location.href = url;
});

if (Settings.tile_markers) {
  Settings.tile_markers
    .map((location: Location) => {
      return new TileMarker(selectedRegion, location, "#FF0000");
    })
    .forEach((tileMarker: TileMarker) => {
      selectedRegion.addEntity(tileMarker);
    });
}

player.perceivedLocation = player.location;
player.destinationLocation = player.location;
/// /////////////////////////////////////////////////////////
// UI controls

document.getElementById("playWaveNum").addEventListener("click", () => {
  window.location.href = `/?wave=${waveInput.value || selectedRegion.wave}`;
});

document
  .getElementById("pauseResumeLink")
  .addEventListener("click", () => (world.isPaused ? world.startTicking() : world.stopTicking()));

ImageLoader.onAllImagesLoaded(() =>
  MapController.controller.updateOrbsMask(Viewport.viewport.player.currentStats, Viewport.viewport.player.stats),
);

ImageLoader.onAllImagesLoaded(() => {
  drawAssetLoadingBar(loadingAssetProgress);
  imagesReady = true;
  checkStart();
});

const interval = setInterval(() => {
  ImageLoader.checkImagesLoaded(interval);
}, 50);

Assets.onAllAssetsLoaded(() => {
  // renders a single frame
  Viewport.viewport.initialise().then(() => {
    console.log("assets are preloaded");
    assetsPreloaded = true;
    checkStart();
  });
});

function drawAssetLoadingBar(loadingProgress: number) {
  const specialAttackBarBackground = ImageLoader.createImage(SpecialAttackBarBackground);
  const { width: canvasWidth, height: canvasHeight } = Chrome.size();
  const canvas = document.getElementById("world") as HTMLCanvasElement;
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#FFFF00";
  context.font = "32px OSRS";
  context.textAlign = "center";
  context.fillText(`Loading models: ${Math.floor(loadingProgress * 100)}%`, canvas.width / 2, canvas.height / 2);
  const scale = 2;
  const left = canvasWidth / 2 - (specialAttackBarBackground.width * scale) / 2;
  const top = canvasHeight / 2 + 20;
  const width = specialAttackBarBackground.width * scale;
  const height = specialAttackBarBackground.height * scale;
  context.drawImage(specialAttackBarBackground, left, top, width, height);
  context.fillStyle = "#730606";
  context.fillRect(left + 2 * scale, top + 6 * scale, width - 4 * scale, height - 12 * scale);
  context.fillStyle = "#397d3b";
  context.fillRect(left + 2 * scale, top + 6 * scale, (width - 4 * scale) * loadingProgress, height - 12 * scale);
  context.fillStyle = "#000000";
  context.globalAlpha = 0.5;
  context.strokeRect(left + 2 * scale, top + 6 * scale, width - 4 * scale, height - 12 * scale);
  context.globalAlpha = 1;
}

let loadingAssetProgress = 0.0;
drawAssetLoadingBar(loadingAssetProgress);

Assets.onAssetProgress((loaded, total) => {
  loadingAssetProgress = loaded / total;
  drawAssetLoadingBar(loadingAssetProgress);
});

const assets2 = setInterval(() => {
  Assets.checkAssetsLoaded(assets2);
}, 50);

let imagesReady = false;
let assetsPreloaded = false;
let started = false;

function checkStart() {
  if (!started && imagesReady && assetsPreloaded) {
    started = true;
    // Start the engine
    world.startTicking();
  }
}

/// /////////////////////////////////////////////////////////

window.newrelic.addRelease("inferno-trainer", process.env.COMMIT_REF);
