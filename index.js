require("dotenv").config();
// const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const bodyParser = require("body-parser");
const {ethers} = require('ethers')
const {
  checkContractBalance,
  transferToPool,
  // transferMatic,
} = require("./contract");
const main = require('./puppet')

process.setMaxListeners(20);


// const fs = require("fs");
// const path = require("path");


// const folderPath = __dirname; // The current folder
// const targetFileName = "error.png";

const workingWallets = 10;
let temp = [];


// const chatObj = {
//   isGiven:true
// };

// const fileOptions = {
//   filename: "error.png",
//   contentType: "image/png",
// };

const app = express();
app.use(bodyParser.json());


// const token = process.env.TOKEN;
// const NGORK_URL = process.env.NGORK_URL;
// const bot = new TelegramBot(token);
// const url = `https://api.telegram.org/bot${token}/setWebhook?url=${NGORK_URL}/webhook/${token}`;
// const checkInterval = 30000;

// ngrok tunnel url
// bot.setWebHook(url);


// Start the server
const port = 3030;
app.listen(port, async() => {
    // console.log(`Server is listening on port ${port}`);
});

// app.post(`/webhook/${token}`, (req, res) => {
//   bot.processUpdate(req.body);
//   res.sendStatus(200);
// });



// bot.on("message", async(msg) => {
//       const chatId = msg.chat.id;
//       const text = msg.text;

//       if(text === "doit") bot.sendMessage(chatId,`/ww`)

//     if(text[0] !== "/")
//     bot.sendMessage(chatId,`commands in bot.... 🤖 \n\n 1. /status  [address] \n 2. /get   [address] `)
// })



// bot.onText(/\/get/,async(msg)=>{
//   const chatId = msg.chat.id;
//   const text = msg.text.slice(5);

//   if (!isValidAddress(text)) {
//     bot.sendMessage(chatId, `${text} is not a valid address...`);
//     return;
//   }

//   bot.sendMessage(
//     chatId,
//     `checking weather account ${text} is capable... \n\n please wait it may take few seconds... 🕛`
//   );

//   await main(text);
//   await findFile(chatId);

//   if (chatObj["isGiven"]) {
//     console.log("chatObj val : ", chatObj["isGiven"]);
//     const balance = await checkContractBalance(text);
//     bot.sendMessage(
//       chatId,
//       `Yeah! Matic has been sended 🚀🚀  \n\n 1.  Chain : Mumbai 💜 \n 2.  address : ${text} \n 3.  Balance : ${balance} Matic`
//     );
//   }else{
//     fs.unlink(targetFileName, (err) => {
//       if (err) {
//         throw err;
//       }
//       console.log("Delete File successfully.");
//     });
//   }

// });


// bot.onText(/\/pool/, async (msg) => {
//   const chatId = msg.chat.id;

//     const len = workerList.length;

  
//   for(let i =0;i<len;i++){

//     if (i == 0 || i == 9) {
//       const date = new Date();
//       const [hour, minutes, seconds] = [
//         date.getHours(),
//         date.getMinutes(),
//         date.getSeconds(),
//       ];
//       bot.sendMessage(
//         chatId,
//         `time : hours:minutes:second- \n\n ${hour}:${minutes}:${seconds}`
//       );
//     }
    
//     const pub = workerList[i].pub;
//     const prv = workerList[i].prv;
//     const balance = await checkContractBalance(pub);
    
//     if(balance > 0.001){

//         try {
//     await transferToPool(prv, pub,balance);
//     bot.sendMessage(
//       chatId,
//       ` ${balance} Matic sended to pool by ${pub}`
//     );
//   }catch(e) {console.log("pool er : ", e);}

//       }else{
//         bot.sendMessage(chatId,`address : ${pub} is low on matic. balance : ${balance}`)
//       }
//     }
// });


// bot.onText(/\/fillup/,async(msg)=>{
//   const chatId = msg.chat.id;
//     const len = workerList.length;


//   for (let i = 0; i < len; i++) {

//     if (i == 0) {
//       const date = new Date();
//       const [hour, minutes, seconds] = [
//         date.getHours(),
//         date.getMinutes(),
//         date.getSeconds(),
//       ];
//       bot.sendMessage(
//         chatId,
//         `time : hours:minutes:second- \n\n ${hour}:${minutes}:${seconds}`
//       );
//     }

//       const pub = workerList[i].pub;
//         try {

//           await main(pub);
//           await findFile(chatId);

//           if (chatObj["isGiven"]) {
//             bot.sendMessage(
//               chatId, `worker ${i+1} with address : ${pub} got 0.2 Matic`
//             );
//           }else {
//             fs.unlink(targetFileName, (err) => {
//               if (err) {
//                 throw err;
//               }
//               console.log("Delete File successfully.");
//             });
//           }

//         } catch (e) {
//           console.log("fillup error : ", e);
//         }

//         if (i == len-1) {
//           const date = new Date();
//           const [hour, minutes, seconds] = [
//             date.getHours(),
//             date.getMinutes(),
//             date.getSeconds(),
//           ];
//           bot.sendMessage(
//             chatId,
//             `time : hours:minutes:second- \n\n ${hour}:${minutes}:${seconds}`
//           );
//         }

//     }

// })


// bot.onText(/\/ww/, async (msg) => {
//   const chatId = msg.chat.id;
//     const len = workerList.length;

//  for (let i = 0; i < len; i++) {

//    const pub = workerList[i].pub;
//    const balance = await checkContractBalance(pub);
//    bot.sendMessage(chatId,`worker wallet no. : ${i+1} \n address : ${pub} \n balance : ${balance} Matic`)
//  }

// })




// bot.onText(/\/status/, async(msg) => {
//   const chatId = msg.chat.id;
//   const text = msg.text.slice(8);
//   if (isValidAddress(text)) {
//     const balance = await checkContractBalance(text);
//     bot.sendMessage(
//       chatId,
//       `Wallet Details 🚀🚀  \n\n 1.  Chain : Mumbai 💜 \n 2.  address : ${text} \n 3.  Balance : ${balance} Matic`
//     );
//   } else {
//     bot.sendMessage(`invalid addrss entered...`);
//   }
// });


// bot.onText(/\/transfer/, async(msg) => {
//     const chatId = msg.chat.id;
//     const text = msg.text.slice(10);
//     const amt = 5;
//       if (isValidAddress(text)) {
//            bot.sendMessage(chatId,`sending matic to ${text} from pool...`);
//            await transferMatic(text, amt);
//            bot.sendMessage(chatId,`Matic sended`);
//       } else {
//         bot.sendMessage(`invalid addrss entered...`);
//       }

// })


// function isValidAddress(address) {
//   const regex = /^0x[a-fA-F0-9]{40}$/;
//   return regex.test(address);
// }


// const findFile = async(chatId) => {

//    return new Promise((resolve, reject) => {
//      fs.readdir(folderPath, (err, files) => {
//        if (err) {
//          console.error("Error reading directory:", err);
//          reject(err);
//          return;
//        }

//        const foundFile = files.find((file) => file === targetFileName);

//        if (foundFile) {
//          console.log(
//            `Found '${targetFileName}' in the folder:`,
//            path.join(folderPath, foundFile)
//          );
//        bot.sendPhoto(chatId, path.join(folderPath, foundFile),fileOptions);
//          chatObj["isGiven"] = false;

//        } else {
//          console.log(`File '${targetFileName}' not found in the folder.`);
//          chatObj["isGiven"] = true;
//        }

//        resolve();
//      });
//    });
// };

const autoFillup = async()=>{
//  console.log("in autoFillups")

    for (let i = 0; i < workingWallets; i++) {

      const wallet = ethers.Wallet.createRandom();
      const pubAddress = wallet.address;
      const prvAddress = wallet.privateKey;

      // console.log(`it worked ${i+1} ⚠️: ${pubAddress}`);

      const obj = { pub: pubAddress, prv: prvAddress };
      temp.push(obj);

      try {
        await main(temp[i].pub);
        const balance = await checkContractBalance(temp[i].pub);
        // console.log(`matic got : ${balance}`)
      } catch (e) {
        // console.log("fillup error : ", e);
      }
    }

}

const autoPools = async()=>{
  //  console.log("in autoPools")

    for (let i = 0; i < workingWallets; i++) {

      const pub = temp[i].pub;
      const prv = temp[i].prv;

      const balance = await checkContractBalance(pub);

      if (balance > 0.001) {
        try {
          await transferToPool(prv, pub, balance);
        } catch (e) {
          // console.log("pool er : ", e);
        }
      } else {
        // console.log(`low on matic, balance: ${balance}`);
      }
    }

}
const runFunctions = async () => {
  while (true) {
    await autoFillup();
    await autoPools();
    // await new Promise((resolve) => setTimeout(resolve, 4 * 60 * 1000)); // Wait for 3 minutes before starting the next iteration
  }
};


runFunctions(); // Call the function initially to start the loop

