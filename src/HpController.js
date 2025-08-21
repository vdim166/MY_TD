class HpController {
  constructor() {
    this.hp = 100;
  }

  getHp() {
    return this.hp;
  }

  setHp(amount) {
    this.hp = amount;
  }

  attack(amount) {
    this.hp -= amount;

    return this.hp;
  }

  isDead() {
    return this.hp <= 0;
  }
}
