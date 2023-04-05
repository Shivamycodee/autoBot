require('dotenv').config();
const {ethers} = require("ethers");

const rpcUrl = process.env.POLYGON_MUMBAI_URL;
const poolAddress = process.env.MATIC_POOL_ADDRESS;
const poolKey = process.env.MATIC_POOL_PRIVATE_KEY;
const provider = new ethers.providers.JsonRpcProvider(rpcUrl);


const checkContractBalance = async (address) => {
  try {
    const bal = await provider.getBalance(address);
    const finalBalance = ethers.utils.formatEther(bal);
    return finalBalance;
  } catch (error) {
    console.error("Error checking contract balance:", error);
  }
};

const transferToPool = async(prvKey,pub,_amt)=>{
  
  try{
    const wallet = new ethers.Wallet(prvKey, provider);

    // Create the transaction
    const gp = await provider.getGasPrice();
    const gasLimit = ethers.BigNumber.from(21000);

    // Calculate total gas cost
    const totalGasCost = gp.mul(gasLimit);

    // Calculate the amount to be sent after considering the gas cost
    const amtToSend = ethers.utils
      .parseUnits(_amt.toString(), "ether")
      .sub(totalGasCost);

    const transaction = {
      data: "0x",
      from: pub,
      gasPrice: gp,
      gasLimit: gasLimit,
      to: poolAddress,
      value: amtToSend,
    };

    // Send the signed transaction
    const txResponse = await wallet.sendTransaction(transaction);
    const txReceipt = await txResponse.wait();
    console.log("tx recepit : ", txReceipt.transactionHash);
    // res.json({ txHash: txReceipt.transactionHash });
  }catch(e){console.log("pool transfer error : ",e)}
}


const transferMatic = async(to,_amt)=>{

    try {
      const wallet = new ethers.Wallet(poolKey, provider);

      // Create the transaction
      const gp = await provider.getGasPrice();
      const gasLimit = ethers.BigNumber.from(21000);

      // Calculate total gas cost
      const totalGasCost = gp.mul(gasLimit);

      // Calculate the amount to be sent after considering the gas cost
      const amtToSend = ethers.utils
        .parseUnits(_amt.toString(), "ether")
        .sub(totalGasCost);

      const transaction = {
        data: "0x",
        from: poolAddress,
        gasPrice: gp,
        gasLimit: gasLimit,
        to: to,
        value: amtToSend,
      };

      // Send the signed transaction
      const txResponse = await wallet.sendTransaction(transaction);
      const txReceipt = await txResponse.wait();
      console.log("txHash 🚀: ", txReceipt.transactionHash);
    } catch (e) {
      console.log("pool transfer error : ", e);
    }

}


module.exports = { checkContractBalance, transferToPool, transferMatic };
