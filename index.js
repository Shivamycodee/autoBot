require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const bodyParser = require("body-parser");
const {ethers} = require('ethers')
const {
  checkContractBalance,
  transferToPool,
  transferMatic,
} = require("./contract");
const main = require('./puppet')

process.setMaxListeners(20);


const fs = require("fs");
const path = require("path");


const folderPath = __dirname; // The current folder
const targetFileName = "error.png";

const workingWallets = 1;
let temp = [];


const chatObj = {
  isGiven:true
};

const fileOptions = {
  filename: "error.png",
  contentType: "image/png",
};

const app = express();
app.use(bodyParser.json());


const token = process.env.TOKEN;
const NGORK_URL = process.env.NGORK_URL;
const bot = new TelegramBot(token);
const url = `https://api.telegram.org/bot${token}/setWebhook?url=${NGORK_URL}/webhook/${token}`;
const checkInterval = 30000;

// ngrok tunnel url
bot.setWebHook(url);


// Start the server
const port = 3030;
app.listen(port, async() => {
    console.log(`Server is listening on port ${port}`);
});

app.post(`/webhook/${token}`, (req, res) => {
  bot.processUpdate(req.body);
  // console.log(req.body.message.chat.id)
  res.sendStatus(200);
});



bot.on("message", async(msg) => {
      const chatId = msg.chat.id;
      const text = msg.text;

      if(text === "doit") bot.sendMessage(chatId,`/ww`)

    if(text[0] !== "/")
    bot.sendMessage(chatId,`commands in bot.... 🤖 \n\n 1. /status  [address] \n 2. /get   [address] `)
})



bot.onText(/\/get/,async(msg)=>{
  const chatId = msg.chat.id;
  const text = msg.text.slice(5);

  if (!isValidAddress(text)) {
    bot.sendMessage(chatId, `${text} is not a valid address...`);
    return;
  }

  bot.sendMessage(
    chatId,
    `checking weather account ${text} is capable... \n\n please wait it may take few seconds... 🕛`
  );

  await main(text);
  await findFile(chatId);

  if (chatObj["isGiven"]) {
    console.log("chatObj val : ", chatObj["isGiven"]);
    const balance = await checkContractBalance(text);
    bot.sendMessage(
      chatId,
      `Yeah! Matic has been sended 🚀🚀  \n\n 1.  Chain : Mumbai 💜 \n 2.  address : ${text} \n 3.  Balance : ${balance} Matic`
    );
  }else{
    fs.unlink(targetFileName, (err) => {
      if (err) {
        throw err;
      }
      console.log("Delete File successfully.");
    });
  }

});


bot.onText(/\/pool/, async (msg) => {
  const chatId = msg.chat.id;

    const len = workerList.length;

  
  for(let i =0;i<len;i++){

    if (i == 0 || i == 9) {
      const date = new Date();
      const [hour, minutes, seconds] = [
        date.getHours(),
        date.getMinutes(),
        date.getSeconds(),
      ];
      bot.sendMessage(
        chatId,
        `time : hours:minutes:second- \n\n ${hour}:${minutes}:${seconds}`
      );
    }
    
    const pub = workerList[i].pub;
    const prv = workerList[i].prv;
    const balance = await checkContractBalance(pub);
    
    if(balance > 0.001){

        try {
    await transferToPool(prv, pub,balance);
    bot.sendMessage(
      chatId,
      ` ${balance} Matic sended to pool by ${pub}`
    );
  }catch(e) {console.log("pool er : ", e);}

      }else{
        bot.sendMessage(chatId,`address : ${pub} is low on matic. balance : ${balance}`)
      }
    }
});


bot.onText(/\/fillup/,async(msg)=>{
  const chatId = msg.chat.id;
    const len = workerList.length;


  for (let i = 0; i < len; i++) {

    if (i == 0) {
      const date = new Date();
      const [hour, minutes, seconds] = [
        date.getHours(),
        date.getMinutes(),
        date.getSeconds(),
      ];
      bot.sendMessage(
        chatId,
        `time : hours:minutes:second- \n\n ${hour}:${minutes}:${seconds}`
      );
    }

      const pub = workerList[i].pub;
        try {

          await main(pub);
          await findFile(chatId);

          if (chatObj["isGiven"]) {
            bot.sendMessage(
              chatId, `worker ${i+1} with address : ${pub} got 0.2 Matic`
            );
          }else {
            fs.unlink(targetFileName, (err) => {
              if (err) {
                throw err;
              }
              console.log("Delete File successfully.");
            });
          }

        } catch (e) {
          console.log("fillup error : ", e);
        }

        if (i == len-1) {
          const date = new Date();
          const [hour, minutes, seconds] = [
            date.getHours(),
            date.getMinutes(),
            date.getSeconds(),
          ];
          bot.sendMessage(
            chatId,
            `time : hours:minutes:second- \n\n ${hour}:${minutes}:${seconds}`
          );
        }

    }

})


bot.onText(/\/ww/, async (msg) => {
  const chatId = msg.chat.id;
    const len = workerList.length;

 for (let i = 0; i < len; i++) {

   const pub = workerList[i].pub;
   const balance = await checkContractBalance(pub);
   bot.sendMessage(chatId,`worker wallet no. : ${i+1} \n address : ${pub} \n balance : ${balance} Matic`)
 }

})




bot.onText(/\/status/, async(msg) => {
  const chatId = msg.chat.id;
  const text = msg.text.slice(8);
  if (isValidAddress(text)) {
    const balance = await checkContractBalance(text);
    bot.sendMessage(
      chatId,
      `Wallet Details 🚀🚀  \n\n 1.  Chain : Mumbai 💜 \n 2.  address : ${text} \n 3.  Balance : ${balance} Matic`
    );
  } else {
    bot.sendMessage(`invalid addrss entered...`);
  }
});


bot.onText(/\/transfer/, async(msg) => {
    const chatId = msg.chat.id;
    const text = msg.text.slice(10);
    const amt = 5;
      if (isValidAddress(text)) {
           bot.sendMessage(chatId,`sending matic to ${text} from pool...`);
           await transferMatic(text, amt);
           bot.sendMessage(chatId,`Matic sended`);
      } else {
        bot.sendMessage(`invalid addrss entered...`);
      }

})


function isValidAddress(address) {
  const regex = /^0x[a-fA-F0-9]{40}$/;
  return regex.test(address);
}


const findFile = async(chatId) => {

   return new Promise((resolve, reject) => {
     fs.readdir(folderPath, (err, files) => {
       if (err) {
         console.error("Error reading directory:", err);
         reject(err);
         return;
       }

       const foundFile = files.find((file) => file === targetFileName);

       if (foundFile) {
         console.log(
           `Found '${targetFileName}' in the folder:`,
           path.join(folderPath, foundFile)
         );
       bot.sendPhoto(chatId, path.join(folderPath, foundFile),fileOptions);
         chatObj["isGiven"] = false;

       } else {
         console.log(`File '${targetFileName}' not found in the folder.`);
         chatObj["isGiven"] = true;
       }

       resolve();
     });
   });
};

const autoFillup = async()=>{
 console.log("in autoFillups")

    for (let i = 0; i < workingWallets; i++) {

      const wallet = ethers.Wallet.createRandom();
      const pubAddress = wallet.address;
      const prvAddress = wallet.privateKey;

      console.log(`it worked ${i+1} ⚠️: ${pubAddress}`);

      const obj = { pub: pubAddress, prv: prvAddress };
      temp.push(obj);

      try {
        await main(temp[i].pub);

        if (chatObj["isGiven"]) {
          console.log("fill success");
        } else {
        }
      } catch (e) {
        console.log("fillup error : ", e);
      }
    }

}

const autoPools = async()=>{
   console.log("in autoPools")

    for (let i = 0; i < workingWallets; i++) {

      const pub = temp[i].pub;
      const prv = temp[i].prv;

      const balance = await checkContractBalance(pub);

      if (balance > 0.001) {
        try {
          await transferToPool(prv, pub, balance);
        } catch (e) {
          console.log("pool er : ", e);
        }
      } else {
        console.log("low on matic");
      }
    }

}
const runFunctions = async () => {
  while (true) {
    await autoFillup();
    await autoPools();
    await new Promise((resolve) => setTimeout(resolve, 3.5 * 60 * 1000)); // Wait for 3 minutes before starting the next iteration
  }
};


runFunctions(); // Call the function initially to start the loop


 workerList = [
   {
     pub: "0x6a804a89b551885E8f98D754e13e8a7584cf4910", // 0
     prv: "428d00adcc25b95502ef10de422dcc8b2ae0516fe326bacc165dd92f577c5718",
   },

   {
     pub: "0xcE3E7a862Ff261DDB1f82070EC4ACdA93232b3A9", // 1
     prv: "af9da34ad68e31d58aaf15d39a9506d22fa666aa1c230193c2849a8cb2a9a0ff",
   },

   {
     pub: "0x2A3AE07A28760C216E44d60758C1FE90410fDB7D", // 2
     prv: "d73a316db7c21a9c9275c8cfbada8a44af6b05d4a9b8077f358b26e627ade375",
   },

   {
     pub: "0x219EC919dD13297D8932f3CB7999B02890BfC599", // 3
     prv: "421e0809231603daa56dc3f73bedcfcb181b5c6a993ab671562ef52bacf1f453",
   },

   {
     pub: "0x40321123E9880AE80FC6D7d4c2276a55F2f8dF9b", // 4
     prv: "f7a0caf1d10caba98a3b2b95ee80ae87fed7c22c05963820e7defadc20011d9a",
   },

   {
     pub: "0x0D40921004570CF5410650d9dBDF1c537331bcB4", // 5
     prv: "f452c65b840f614b25cff586acfbea99789f0a26d74f74af8c2a19f2ea277ef9",
   },

   {
     pub: "0x010813f232B4E66feaA6eC54536Cd8eBef9051Ef", // 6
     prv: "06495735233ad818e9eae2d13b11a5276461ca20864456692c7ba2a0a8d32118",
   },

   {
     pub: "0xD5acA83B8aBcDC89ED18c82b12518fFcd534c684", //7
     prv: "8453584a8b68456fb7d7fac8470ea974a48d6c6f99bdb7d174e9e46ca5d02e2b",
   },

   {
     pub: "0x8309E5a8F848C2f2964B31F5219704f5d1316089", //8
     prv: "9e089615e514f8b3dd9f7ade2b14910447d483e15e3b5c00c0df1cca19cc6349",
   },

   {
     pub: "0x67EaE03Bfe0eAB5291ebE427cAFDec98068AC7D0", //9  old <-
     prv: "a593155fe8620853283c794782de047e141901c2912205eb236ee50d3e7b90ea",
   },
   {
     pub: "0x1143de1b3ad63887e5da97ed36d5d95edd15c66a", //10 new->
     prv: "752e4ddb0e3abd853f9960dc89d95bf042ab9f16cc4eb5a6bd756214c0dbffac",
   },
   {
     pub: "0x886df3f704dcf43ad60f8ce3fdb8348b50a06ed8", //11
     prv: "95bfde1a34f6de3a6cdd18f7b1ba8c0137caa9c40d332e6cdd9ade693f6ada9e",
   },
   {
     pub: "0xfe99500dd0295555d796ca66e1a25cf6f7c98d71", //12
     prv: "a0dcbb7a76a4d365991d7a2e0e09084330dcca875d143e9c0c769fd8c8e3945f",
   },
   {
     pub: "0xd8c18f8b99002e91d25d12d59e38c9cfa9703e70", //13
     prv: "d6b1ae9461ff8eae2b262f7f347561bc0b4054912a723c85ebe288c3de4ebc4b",
   },
   {
     pub: "0xd31e82a908ccb7bfb29c42ec7259a20038c8e4f9", //14
     prv: "c2c5fe22d7f51d1c4c12cbe3a376fd6821f08018fd9d7af793092c99b29b307e",
   },
   {
     pub: "0xdc022e2873cfa10200f81421f0b06332f2629228", //15
     prv: "2fb71e0897bf16a0eaee77ebd0f77a9fdd46beabdf9d4ba49efd1b2d6e6cca75",
   },
   {
     pub: "0x2bfd4233931832d1b174d125ad485e10f2a24b1b", //16
     prv: "788a926d4b452e9fb581b98ae319fdf8ec8131d1ba9cace5791f3b2ef2e89969",
   },
   {
     pub: "0xd945441eee6494a32ed4377659a552e4ec71221f", //17
     prv: "a835df9374f7f941208d8a22daf4cd84e16ca33c27c169ac0e782fb34247c417",
   },
   {
     pub: "0x80322916c3dfb8473f6053ca4e923f49087f60da", //18
     prv: "f92d9aabf612ef864f9e860fff6bee4f80a31d1cb9c86880cf23f87b756ebdc2",
   },
   {
     pub: "0xd1bc8f8a39b02541f446435b8d7cf2a6eca7d3be", //19
     prv: "6d3e7ad81ccff48c1f4043d9e2ff6a320a176ff95686ca10803eff0f259f984c",
   },
   {
     pub: "0x3b4e9a20a1d52c962bf71101cc072ae15a386f7d", //20
     prv: "8a0a2bf8cfef29e653c3f38b886b9d2e53973442262475909b32b55e749152f1",
   },
 ];
