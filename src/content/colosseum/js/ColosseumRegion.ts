"use strict";

// TODO
import InfernoMapImage from "../../../content/inferno/assets/images/map.png";
import { Player } from "../../../sdk/Player";

import { CardinalDirection, Region } from "../../../sdk/Region";
import { Settings } from "../../../sdk/Settings";
import { ImageLoader } from "../../../sdk/utils/ImageLoader";
import { Viewport } from "../../../sdk/Viewport";
import { ColosseumLoadout } from "./ColosseumLoadout";
import { ColosseumScene } from "./ColosseumScene";
import { SolHeredit as SolHeredit } from "./mobs/SolHeredit";

/* eslint-disable @typescript-eslint/no-explicit-any */

export class ColosseumRegion extends Region {
  wave: number;
  mapImage: HTMLImageElement = ImageLoader.createImage(InfernoMapImage);

  get initialFacing() {
    return CardinalDirection.NORTH;
  }

  getName() {
    return "Fortis Colosseum";
  }

  get width(): number {
    return 51;
  }

  get height(): number {
    return 57;
  }

  rightClickActions(): any[] {
    if (this.wave !== 0) {
      return [];
    }

    return [
      {
        text: [
          { text: "Spawn ", fillStyle: "white" },
          { text: "Mager", fillStyle: "red" },
        ],
        action: () => {
          Viewport.viewport.clickController.yellowClick();
          const x = Viewport.viewport.contextMenu.destinationLocation.x;
          const y = Viewport.viewport.contextMenu.destinationLocation.y;
          const mob = new SolHeredit(this, { x, y }, { aggro: Viewport.viewport.player });
          mob.removableWithRightClick = true;
          this.addMob(mob);
        },
      },
    ];
  }

  initializeAndGetLoadoutType() {
    const loadoutSelector = document.getElementById("loadouts") as HTMLInputElement;
    loadoutSelector.value = Settings.loadout;
    loadoutSelector.addEventListener("change", () => {
      Settings.loadout = loadoutSelector.value;
      Settings.persistToStorage();
    });

    return loadoutSelector.value;
  }

  drawWorldBackground(context: OffscreenCanvasRenderingContext2D, scale: number) {
    context.fillStyle = "black";
    context.fillRect(0, 0, 10000000, 10000000);
    if (this.mapImage) {
      const ctx = context as any;
      ctx.webkitImageSmoothingEnabled = false;
      ctx.mozImageSmoothingEnabled = false;
      context.imageSmoothingEnabled = false;

      context.fillStyle = "white";

      context.drawImage(this.mapImage, 0, 0, this.width * scale, this.height * scale);

      ctx.webkitImageSmoothingEnabled = true;
      ctx.mozImageSmoothingEnabled = true;
      context.imageSmoothingEnabled = true;
    }
  }

  drawDefaultFloor() {
    // replaced by an Entity in 3d view
    return !Settings.use3dView;
  }

  initialiseRegion() {
    // create player
    const player = new Player(this, {
      x: 25,
      y: 25,
    });

    this.addPlayer(player);

    const loadout = new ColosseumLoadout("max_melee");
    loadout.setStats(player);
    player.setUnitOptions(loadout.getLoadout());

    this.addMob(new SolHeredit(this, { x: 25, y: 30 }, { aggro: player }));
    this.addMob(new SolHeredit(this, { x: 25, y: 35 }, { aggro: player }));
    this.addMob(new SolHeredit(this, { x: 25, y: 40 }, { aggro: player }));

    // Add 3d scene
    if (Settings.use3dView) {
      this.addEntity(new ColosseumScene(this, { x: 0, y: 48 }));
    }

    return {
      player: player,
    };
  }
}
