import { Player } from "../../src/sdk/Player";
import { World } from "../../src/sdk/World";
import { Viewport } from "../../src/sdk/Viewport";
import { TestRegion } from "../utils/TestRegion";
import { SolHeredit } from "../../src/content/colosseum/js/mobs/SolHeredit";
import { forceRandom } from "../setupFiles";
import { FourTickDummyWeapon } from "../../src/content/weapons/FourTickDummyWeapon";
import { ScytheOfVitur } from "../../src/content/weapons/ScytheOfVitur";

// sol heredit movement tests
describe("sol heredit attacks", () => {
  let region: TestRegion;
  let world: World;
  let player: Player;
  let boss: SolHeredit;

  beforeEach(() => {
    region = new TestRegion(30, 30);
    world = new World();
    region.world = world;
    world.addRegion(region);
    Viewport.setupViewport(region, true);
    player = new Player(region, { x: 15, y: 15 });
    boss = new SolHeredit(region, { x: 13, y: 20 }, { aggro: player });
    region.addPlayer(player);
    Viewport.viewport.setPlayer(player);
  });

  // checking the timing between the attack sequence starting and taking damage
  test("check timing of damage is correct", () => {
    boss.setAggro(player);
    region.addMob(boss);

    // < 0.5 shield, else spear
    forceRandom(1.0);
    world.tickWorld();
    expect(boss.firstSpear).toEqual(false);
    world.tickWorld(2);
    expect(player.currentStats.hitpoint).toEqual(99);
    world.tickWorld();
    // player got hit
    expect(player.currentStats.hitpoint).toBeLessThan(99);
    let hp = player.currentStats.hitpoint;
    world.tickWorld(3);
    forceRandom(1.0);
    expect(boss.firstSpear).toEqual(false);
    world.tickWorld();
    expect(boss.firstSpear).toEqual(true);
    world.tickWorld();
    expect(player.currentStats.hitpoint).toEqual(hp);
    world.tickWorld(2);
    // player got hit again
    expect(player.currentStats.hitpoint).toBeLessThan(hp);
  });

  test("check boss must be adjacent for one tick to attack", () => {
    boss.setAggro(player);
    region.addMob(boss);
    boss.setLocation({ x: 13, y: 24 });

    world.tickWorld();
    expect(boss.location.y).toEqual(22);
    expect(boss.hasLOS).toEqual(false);
    expect(boss.attackDelay).toBeLessThan(0);
    world.tickWorld();
    expect(boss.location.y).toEqual(20);
    expect(boss.hasLOS).toEqual(true);
    // does not attack here
    expect(boss.attackDelay).toBeLessThan(0);
    world.tickWorld();
    expect(boss.location.y).toEqual(20);
    expect(boss.attackDelay).toBeGreaterThan(0);
  });

  test("check moving one tick at a time delays attack", () => {
    boss.setAggro(player);
    region.addMob(boss);
    boss.setLocation({ x: 13, y: 23 });
    world.tickWorld();
    expect(boss.location.y).toEqual(21);

    for (let yy = 14; yy > 5; --yy) {
      player.moveTo(13, yy);
      world.tickWorld();
      expect(boss.location.y).toEqual(yy + 6);
      expect(boss.hasLOS).toEqual(true);
      expect(boss.attackDelay).toBeLessThan(0);
    }
  });

  test("drag tech simulation", () => {
    let fourTickWeapon = new FourTickDummyWeapon();
    let fiveTickWeapon = new ScytheOfVitur();
    // simulating https://youtu.be/b7Iv7cf-taQ?t=577
    boss.setAggro(player);
    region.addMob(boss);
    boss.stunned = 4;
    boss.setLocation({ x: 10, y: 10 });
    fourTickWeapon.inventoryLeftClick(player);

    player.setLocation({ x: 12, y: 15 });
    player.setAggro(boss);

    world.tickWorld();
    expect(boss.location).toEqual({ x: 10, y: 10 });
    expect(player.location).toEqual({ x: 12, y: 13 });

    world.tickWorld();
    expect(boss.location).toEqual({ x: 10, y: 10 });
    expect(player.location).toEqual({ x: 12, y: 11 });
    expect(player.attackDelay).toEqual(4);
    fiveTickWeapon.inventoryLeftClick(player);
    player.moveTo(9, 8);

    world.tickWorld();
    expect(boss.location).toEqual({ x: 10, y: 10 });
    expect(player.location).toEqual({ x: 10, y: 9 });
    forceRandom(1.0); // spear

    world.tickWorld();
    expect(boss.location).toEqual({ x: 10, y: 10 });
    expect(player.location).toEqual({ x: 9, y: 8 });
    player.setAggro(boss);

    world.tickWorld();
    expect(boss.attackDelay).toEqual(7);

    world.tickWorld();
    expect(player.attackDelay).toEqual(5);
    player.moveTo(8, 8);

    world.tickWorld();
    expect(player.location).toEqual({ x: 8, y: 8 });
    player.setAggro(boss);

    world.tickWorld();
    expect(player.location).toEqual({ x: 9, y: 8 });
    expect(player.currentStats.hitpoint).toEqual(99);

    world.tickWorld();
    expect(player.location).toEqual({ x: 9, y: 8 });
    expect(player.currentStats.hitpoint).toEqual(99);
    player.moveTo(8, 7);

    world.tickWorld();
    expect(player.location).toEqual({ x: 8, y: 7 });
    player.setAggro(boss);

    // phased the boss here
    boss.currentStats.hitpoint = 1337;
    // TODO implement phase transition
    boss.stunned = 7;

    world.tickWorld();
    expect(player.location).toEqual({ x: 9, y: 7 });
    expect(player.attackDelay).toEqual(5);

    world.tickWorld();
    world.tickWorld();
    player.moveTo(8, 8);
    world.tickWorld();
    player.moveTo(8, 9);
    world.tickWorld();
    world.tickWorld();
    player.setAggro(boss);
    world.tickWorld();
    expect(player.location).toEqual({ x: 8, y: 9 });
    expect(boss.location).toEqual({ x: 9, y: 10 });
    expect(player.attackDelay).toEqual(5);
    expect(boss.attackDelay).toBeLessThan(0);
    player.moveTo(9, 11);

    world.tickWorld();
    expect(player.location).toEqual({ x: 9, y: 11 });
    expect(boss.location).toEqual({ x: 9, y: 10 });
    expect(boss.attackDelay).toBeLessThan(0);
    player.moveTo(9, 12);

    world.tickWorld();
    expect(player.location).toEqual({ x: 9, y: 12 });
    expect(boss.location).toEqual({ x: 9, y: 11 });
    expect(boss.attackDelay).toBeLessThan(0);
    player.moveTo(9, 13);
  });
});
