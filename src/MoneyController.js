class MoneyController {
  constructor(initial = 0) {
    this.money = initial;
  }

  getMoney() {
    return this.money;
  }

  setMoney(value) {
    this.money = value;
  }

  addMoney(value) {
    this.money += value;
    return this.money;
  }

  spendMoney(value) {
    if (value > this.money) {
      return { status: false, money: this.money };
    }

    this.money -= value;
    return {
      status: true,
      money: this.money,
    };
  }
}
