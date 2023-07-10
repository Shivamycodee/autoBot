require("dotenv").config();
const {ethers} = require('ethers')
const {
  checkContractBalance,
  transferToPool,
} = require("./contract");
const main = require('./puppet')

process.setMaxListeners(30);


const workingWallets = 5;
let temp = [];


const autoFillup = async()=>{
     console.log("fill up.")

    for (let i = 0; i < workingWallets; i++) {

      const wallet = ethers.Wallet.createRandom();
      const pubAddress = wallet.address;
      const prvAddress = wallet.privateKey;

      const obj = { pub: pubAddress, prv: prvAddress };
      temp.push(obj);

      try {
        await main(temp[i].pub);
       if(i == 3){
         const balance = await checkContractBalance(temp[i].pub);
        console.log(balance)
      }
      } catch (e) {
      }
    }

}

const autoPools = async()=>{
     console.log("pools.");

    for (let i = 0; i < workingWallets; i++) {

      const pub = temp[i].pub;
      const prv = temp[i].prv;

      const balance = await checkContractBalance(pub);

      if (balance > 0.001) {
        try {
          await transferToPool(prv, pub, balance);
        } catch (e) {
        }
      } else {
      }
    }

}
const runFunctions = async () => {
  while (true) {
    await autoFillup();
    await autoPools();
  }
};


function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}


runFunctions(); // Call the function initially to start the loop

