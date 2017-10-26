// Character class
class Character {
  constructor(hash) {
    this.hash = hash;
    this.x = 0;
    this.y = 0;
    this.prevX = 0;
    this.prevY = 0;
    this.destX = 0;
    this.destY = 0;
    this.width = 100;
    this.height = 100;
    this.moveLeft = false;
    this.moveRight = false;
    this.alpha = 0.05;
    this.frame = 0;
    this.frameCount = 0;
    this.direction = 0;
    this.id = '';
    this.lastUpdate = new Date().getTime();
    this.hasJumped = false;
  }
}

module.exports = Character;
