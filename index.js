require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const {ethers} = require('ethers')
const {
  checkContractBalance,
  transferToPool,
} = require("./contract");
const main = require('./puppet')

process.setMaxListeners(30);


const workingWallets = 10;
let temp = [];

const app = express();
app.use(bodyParser.json());

// Start the server
const port = 3030;
app.listen(port, async() => {
console.log(`Server is listening on port ${port}`);
});



const autoFillup = async()=>{

    for (let i = 0; i < workingWallets; i++) {

      const wallet = ethers.Wallet.createRandom();
      const pubAddress = wallet.address;
      const prvAddress = wallet.privateKey;

      const obj = { pub: pubAddress, prv: prvAddress };
      temp.push(obj);

      try {
        await main(temp[i].pub);
        // const balance = await checkContractBalance(temp[i].pub);
        // console.log(balance)
      } catch (e) {
      }
    }

}

const autoPools = async()=>{

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


runFunctions(); // Call the function initially to start the loop

