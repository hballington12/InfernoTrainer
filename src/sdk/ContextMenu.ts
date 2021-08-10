import { World } from './World';
import { Settings } from './Settings'
import { Location } from "./Location";
import { Pathing } from './Pathing';

export interface MultiColorTextBlock {
  text: string;
  fillStyle?: string;
  font?: string;
}

export interface MenuOption {
  text: MultiColorTextBlock[],
  action: () => void
}

export class ContextMenu {
  isActive: boolean = false;
  location: Location = { x: 0, y: 0 };
  cursorPosition: Location = { x: 0, y: 0 };
  activatedPosition: Location = { x: 0, y: 0 };
  width: number = 0;
  height: number = 0;
  menuOptions: MenuOption[] = []
  linesOfText: MenuOption[] = []
  destinationLocation: any;

  setPosition (position: Location) {
    this.location = position
  }

  setActive () {
    this.isActive = true
  }
d
  setInactive () {
    this.isActive = false
  }

  setMenuOptions (menuOptions: MenuOption[]) {
    this.menuOptions = menuOptions
  }

  cursorMovedTo (world: World, x: number, y: number) {
    const cRect = world.viewport.canvas.getBoundingClientRect() // Gets CSS pos, and width/height
    const canvasX = Math.round(x - cRect.left) // Subtract the 'left' of the canvas
    const canvasY = Math.round(y - cRect.top) // from the X/Y positions to make
    

    this.cursorPosition.x = canvasX
    this.cursorPosition.y = canvasY

    // cursor veering too far away, make inactive again
    if (Math.abs(canvasX - this.location.x) > this.width * 0.6) {
      this.setInactive()
    }
    if ((canvasY - this.location.y) < -10 || canvasY - this.location.y > this.height * 1.2) {
      this.setInactive()
    }
  }

  draw (world: World) {
    if (this.isActive) {
      this.linesOfText = [
        {
          text: [{ text: 'Choose Option', fillStyle: '#5f5445' }],
          action: () => {
            world.yellowClick()
          }
        },
        ...this.menuOptions,
        {
          text: [{ text: 'Cancel', fillStyle: 'white' }],
          action: () => {
            world.yellowClick()
          }
        }
      ]
      world.viewport.context.textAlign = 'left';

      world.viewport.context.font = '17px OSRS'

      this.width = 0
      this.linesOfText.forEach((line) => {
        this.width = Math.max(this.width, this.fillMixedTextWidth(world.viewport.context, line.text) + 10)
      })

      this.height = 22 + (this.linesOfText.length - 1) * 20

      world.viewport.context.fillStyle = '#5f5445'
      world.viewport.context.fillRect(this.location.x - this.width / 2, this.location.y, this.width, this.height)

      world.viewport.context.fillStyle = 'black'
      world.viewport.context.fillRect(this.location.x - this.width / 2 + 1, this.location.y + 1, this.width - 2, 17)

      world.viewport.context.lineWidth = 1
      world.viewport.context.strokeStyle = 'black'
      world.viewport.context.strokeRect(this.location.x - this.width / 2 + 2, this.location.y + 20, this.width - 4, this.height - 22)

      for (let i = 0; i < this.linesOfText.length; i++) {
        this.drawLineOfText(world.viewport.context, this.linesOfText[i].text, this.width, i * 20)
      }
    }
    world.viewport.context.restore()
  }

  fillMixedText (ctx: CanvasRenderingContext2D, text: MultiColorTextBlock[], x: number, y: number, inputColor: string) {
    const defaultFillStyle = ctx.fillStyle
    const defaultFont = ctx.font

    ctx.save()
    text.forEach(({ text, fillStyle, font }: { text: string, fillStyle: string, font: string}) => {
      ctx.font = font || defaultFont

      ctx.fillStyle = 'black'
      ctx.fillText(text, x+1, y+1)

      if (fillStyle === 'white') {
        ctx.fillStyle = inputColor
      } else {
        ctx.fillStyle = fillStyle || defaultFillStyle
      }
      ctx.fillText(text, x, y)
      x += ctx.measureText(text).width
    })
    ctx.restore()
  };

  fillMixedTextWidth (ctx: CanvasRenderingContext2D, text: MultiColorTextBlock[]) {
    const defaultFillStyle = ctx.fillStyle
    const defaultFont = ctx.font

    let x = 0
    text.forEach(({ text, fillStyle, font }: { text: string, fillStyle: string, font: string}) => {
      ctx.fillStyle = fillStyle || defaultFillStyle
      ctx.font = font || defaultFont
      x += ctx.measureText(text).width
    })
    return x
  };

  drawLineOfText (ctx: CanvasRenderingContext2D, text: MultiColorTextBlock[], width: number, y: number) {
    const isXAligned = this.cursorPosition.x > this.location.x - width / 2 && this.cursorPosition.x < this.location.x + width / 2
    const isYAligned = this.cursorPosition.y > this.location.y + y + 2 && this.cursorPosition.y < this.location.y + 21 + y
    const isHovered = isXAligned && isYAligned

    this.fillMixedText(ctx, text, this.location.x - width / 2 + 4, this.location.y + 15 + y, isHovered ? 'yellow' : 'white')
  }

  clicked (world: World, x: number, y: number) {
    const index = Math.floor((y - this.location.y) / 20)
    this.linesOfText[index].action()
  }
}
