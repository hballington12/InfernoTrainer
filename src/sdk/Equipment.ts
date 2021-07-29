import { Item } from "./Item";
import { UnitBonuses, UnitEquipment } from "./Unit";
import { SetEffect } from "./SetEffect"
import { Player } from "./Player";
import { InventoryControls } from "./cps/InventoryControls";

export enum EquipmentTypes {
  HELMET ='helmet',
  CHEST = 'chest',
  LEGS = 'legs',
  FEET = 'feet',
  GLOVES = 'gloves',
  WEAPON = 'weapon',
  OFFHAND = 'offhand',
  AMMO = 'ammo',
  BACK = 'back'
}

export class Equipment extends Item {
  bonuses: UnitBonuses;

  constructor() {
    super()
    this.setStats();
  }

  get hasInventoryLeftClick(): boolean {
    return true;
  }

  inventoryLeftClick(player: Player) {
    const currentItem = this.currentEquipment(player) || null; 
    let openInventorySlots = InventoryControls.openInventorySlots()
    openInventorySlots.unshift(InventoryControls.inventory.indexOf(this))
    this.assignToUnitEquipment(player.equipment);
    InventoryControls.inventory[openInventorySlots.shift()] = currentItem;
    player.equipmentChanged()
  }

  get equipmentSetEffect(): typeof SetEffect{
    return null;
  }

  setStats() {
    // throw new Error('stats must be set, none were found')
  }

  currentEquipment(player: Player): Equipment {
    return null;
  }

  assignToUnitEquipment(unitEquipment: UnitEquipment) {
    throw new Error('not able to assign to unit equipment')
  }

  get type(): EquipmentTypes {
    throw new Error('equipment must have a type');
  }

}