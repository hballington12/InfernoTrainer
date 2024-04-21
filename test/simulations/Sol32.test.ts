import { Player } from "../../src/sdk/Player";
import { World } from "../../src/sdk/World";
import { Viewport } from "../../src/sdk/Viewport";
import { TestRegion } from "../utils/TestRegion";
import { SolHeredit } from "../../src/content/colosseum/js/mobs/SolHeredit";
import { forceRandom } from "../setupFiles";
import { FourTickDummyWeapon } from "../../src/content/weapons/FourTickDummyWeapon";
import { ScytheOfVitur } from "../../src/content/weapons/ScytheOfVitur";
import { CollisionType } from "../../src/sdk/Collision";

// sol heredit 32-tick reproduction of kiwi iskadda's fight in https://www.youtube.com/watch?v=b7Iv7cf-taQ
describe("sol heredit attacks", () => {
  let region: TestRegion;
  let world: World;
  let player: Player;
  let boss: SolHeredit;
  const fourTickWeapon = new FourTickDummyWeapon();
  const fiveTickWeapon = new ScytheOfVitur();

  beforeAll(() => {
    region = new TestRegion(30, 30);
    world = new World();
    region.world = world;
    world.addRegion(region);
    Viewport.setupViewport(region, true);
    player = new Player(region, { x: 12, y: 15 });
    boss = new SolHeredit(region, { x: 10, y: 10 }, { aggro: player });
    region.addPlayer(player);
    Viewport.viewport.setPlayer(player);
    boss.setAggro(player);
    region.addMob(boss);
    boss.stunned = 4;
    fourTickWeapon.inventoryLeftClick(player);
    player.setLocation({ x: 12, y: 15 });
  });

  test("tick 1", () => {
    expect(boss.location).toEqual({ x: 10, y: 10 });
    expect(player.location).toEqual({ x: 12, y: 15 });
    player.setAggro(boss);
  });
  
  test("tick 2", () => {
    world.tickWorld();
    expect(boss.location).toEqual({ x: 10, y: 10 });
    expect(player.location).toEqual({ x: 12, y: 13 });
  });

  test("tick 3", () => {
    world.tickWorld();
    expect(boss.location).toEqual({ x: 10, y: 10 });
    expect(player.location).toEqual({ x: 12, y: 11 });
    expect(player.attackDelay).toEqual(4);
    fiveTickWeapon.inventoryLeftClick(player);
    player.moveTo(9, 8);
  });

  test("tick 4", () => {
    world.tickWorld();
    expect(boss.location).toEqual({ x: 10, y: 10 });
    expect(player.location).toEqual({ x: 10, y: 9 });
  });

  test("tick 5", () => {
    forceRandom(1.0); // spear
    world.tickWorld();
    expect(boss.location).toEqual({ x: 10, y: 10 });
    expect(player.location).toEqual({ x: 9, y: 8 });
  });

  test("tick 6", () => {
    player.setAggro(boss);
    world.tickWorld();
    expect(boss.location).toEqual({ x: 10, y: 10 });
    expect(boss.attackDelay).toEqual(7);
  });

  test("tick 7", () => {
    world.tickWorld();
    expect(boss.location).toEqual({ x: 10, y: 10 });
    expect(player.attackDelay).toEqual(5);
    player.moveTo(8, 8);
  });

  test("tick 8", () => {
    world.tickWorld();
    expect(boss.location).toEqual({ x: 10, y: 10 });
    expect(player.location).toEqual({ x: 8, y: 8 });
    player.setAggro(boss);
  });

  test("tick 9", () => {
    world.tickWorld();
    expect(boss.location).toEqual({ x: 10, y: 10 });
    expect(player.location).toEqual({ x: 9, y: 8 });
    expect(player.currentStats.hitpoint).toEqual(99);
    player.moveTo(9, 7);
  });

  test("tick 10", () => {
    world.tickWorld();
    expect(boss.location).toEqual({ x: 10, y: 10 });
    expect(player.location).toEqual({ x: 9, y: 7 });
    expect(player.currentStats.hitpoint).toEqual(99);
    player.setAggro(boss);
  });

  test("tick 11", () => {
    world.tickWorld();
    expect(boss.location).toEqual({ x: 10, y: 10 });
    expect(player.location).toEqual({ x: 9, y: 7 });
    player.setAggro(boss);
  });

  test("tick 12", () => {
    // hit the boss here
    world.tickWorld();
    expect(boss.location).toEqual({ x: 10, y: 10 });
    expect(player.location).toEqual({ x: 9, y: 7 });
    expect(player.attackDelay).toEqual(5);
  });

  test("tick 13", () => {
    // phased the boss here - "Not bad. Let's try something else..."
    boss.currentStats.hitpoint = 1337;
    // TODO implement phase transition
    boss.stunned = 6;
    world.tickWorld();
    expect(boss.location).toEqual({ x: 10, y: 10 });
    expect(player.location).toEqual({ x: 9, y: 7 });
  });

  test("tick 14", () => {
    world.tickWorld();
    expect(boss.location).toEqual({ x: 10, y: 10 });
    player.moveTo(8, 8);
  });

  test("tick 15", () => {
    world.tickWorld();
    expect(player.location).toEqual({ x: 8, y: 8 });
    expect(boss.location).toEqual({ x: 10, y: 10 });
    player.moveTo(8, 9);
  });

  test("tick 16", () => {
    world.tickWorld();
    expect(player.location).toEqual({ x: 8, y: 9 });
    expect(boss.location).toEqual({ x: 10, y: 10 });
    player.setAggro(boss);
  });

  test("tick 17", () => {
    world.tickWorld();
    expect(player.location).toEqual({ x: 9, y: 9 });
    expect(boss.location).toEqual({ x: 10, y: 10 });
    expect(player.attackDelay).toEqual(5);
    player.moveTo(9, 11);
  });

  test("tick 18", () => {
    world.tickWorld();
    expect(player.location).toEqual({ x: 9, y: 11 });
    expect(boss.location).toEqual({ x: 10, y: 10 });
    expect(boss.attackDelay).toBeLessThan(0); // boss is not attacking
    player.moveTo(9, 12);
  });

  test("tick 19", () => {
    world.tickWorld();
    expect(player.location).toEqual({ x: 9, y: 12 });
    expect(boss.location).toEqual({ x: 9, y: 10 });
    expect(boss.attackDelay).toBeLessThan(0);
    player.moveTo(9, 13);
  });

  test("tick 20", () => {
    world.tickWorld();
    expect(player.location).toEqual({ x: 9, y: 13 });
    expect(boss.location).toEqual({ x: 9, y: 11 });
    expect(boss.attackDelay).toBeLessThan(0);
    player.moveTo(9, 14);
  });

  test("tick 21", () => {
    world.tickWorld();
    expect(player.location).toEqual({ x: 9, y: 14 });
    expect(boss.location).toEqual({ x: 9, y: 12 });
    expect(boss.attackDelay).toBeLessThan(0);
    player.setAggro(boss);
  });

  test("tick 22", () => {
    world.tickWorld();
    expect(player.location).toEqual({ x: 9, y: 14 });
    expect(boss.location).toEqual({ x: 9, y: 13 });
    expect(player.attackDelay).toEqual(5);
    expect(boss.attackDelay).toBeLessThan(0);
  });

  test("tick 23", () => {
    forceRandom(1.0); // spear
    world.tickWorld();
    expect(player.location).toEqual({ x: 9, y: 14 });
    expect(boss.location).toEqual({ x: 9, y: 13 });
    expect(boss.attackDelay).toEqual(7);
    player.moveTo(10, 15);
  });

  test("tick 24", () => {
    world.tickWorld();
    expect(player.location).toEqual({ x: 10, y: 15 });
    expect(boss.location).toEqual({ x: 9, y: 13 });
  });

  test("tick 25", () => {
    world.tickWorld();
    expect(player.location).toEqual({ x: 10, y: 15 });
    expect(boss.location).toEqual({ x: 9, y: 13 });
    expect(player.stats.hitpoint).toEqual(99); // didn't get hit
    player.setAggro(boss);
  });

  test("tick 26", () => {
    world.tickWorld();
    expect(player.location).toEqual({ x: 10, y: 14 });
    expect(boss.location).toEqual({ x: 9, y: 13 });
    expect(player.stats.hitpoint).toEqual(99);
    player.setAggro(boss);
  });
  

  test("tick 27", () => {
    world.tickWorld();
    expect(player.location).toEqual({ x: 10, y: 14 });
    expect(boss.location).toEqual({ x: 9, y: 13 });
    expect(player.attackDelay).toEqual(5);
  });
  

  test("tick 28", () => {
    world.tickWorld();
    expect(player.location).toEqual({ x: 10, y: 14 });
    expect(boss.location).toEqual({ x: 9, y: 13 });
    player.moveTo(11, 15);
  });
  

  test("tick 29", () => {
    world.tickWorld();
    expect(player.location).toEqual({ x: 11, y: 15 });
    expect(boss.location).toEqual({ x: 9, y: 13 });
    player.moveTo(11, 16);
  });
  

  test("tick 30", () => {
    world.tickWorld();
    expect(player.location).toEqual({ x: 11, y: 16 });
    expect(boss.location).toEqual({ x: 9, y: 14 });
    player.setAggro(boss);
  });

  test("tick 31", () => {
    world.tickWorld();
    expect(player.location).toEqual({ x: 11, y: 16 });
    expect(boss.location).toEqual({ x: 9, y: 15 });
  });

  test("tick 32", () => {
    forceRandom(0.0); // shield
    world.tickWorld();
    expect(player.location).toEqual({ x: 11, y: 16 });
    expect(boss.location).toEqual({ x: 9, y: 15 });
    expect(player.attackDelay).toEqual(5);
    expect(boss.attackDelay).toEqual(6);
  });
});
