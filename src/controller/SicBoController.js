import Web3 from "web3";
import SicBo from "../sic_bo";
class SicBoController {
  constructor() {
      console.log("SicBoController");
    this.web3 = new Web3(window.ethereum);
  }

  startGame(address) {
    this.sicBo = SicBo(address);
    console.log(this.sicBo);
    return this.sicBo;
  }

  async bet(isOver, amount) {
    const accounts = await this.web3.eth.getAccounts();
    await this.sicBo.methods.bet(isOver).send({
      from: accounts[0],
      value: amount,
    });
  }

  getBets() {}

  getDices() {}

  getBetByPlayer(player) {}

  endGame() {
    this.sicBo.endGame();
  }

  rollDice() {
    this.sicBo.rollDice();
  }
}

export default SicBoController;


