require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const bodyParser = require("body-parser");
const { checkContractBalance, transferToPool } = require("./contract");
const main = require('./puppet')

const fs = require("fs");
const path = require("path");


const folderPath = __dirname; // The current folder
const targetFileName = "error.png";


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

    try {
    await transferToPool(workerList[6].prv,workerList[6].pub)
    } catch (e) {
      console.log("pool index : ", e);
    }
  }

  fs.unlink(targetFileName, (err) => {
    if (err) {
      throw err;
    }
    console.log("Delete File successfully.");
  });

});


bot.onText(/\/pool/, async (msg) => {
  const chatId = msg.chat.id;
  
  for(let i =0;i<10;i++){

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

  for (let i = 0; i < 10; i++) {
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

    }

})


bot.onText(/\/ww/, async (msg) => {
  const chatId = msg.chat.id;
 for (let i = 0; i < 10; i++) {

   const pub = workerList[i].pub;
   const balance = await checkContractBalance(pub);
   bot.sendMessage(chatId,`worker wallet no. : ${i+1} \n address : ${pub} \n balance : ${balance}`)
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
         bot.sendMessage(chatId, `Error while fetching token`);
         bot.sendPhoto(chatId, path.join(folderPath, foundFile),fileOptions);
         chatObj["isGiven"] = false;
        // fs.unlinkSync(path.join(folderPath, foundFile));

       } else {
         console.log(`File '${targetFileName}' not found in the folder.`);
        //  bot.sendMessage(chatId, `Matic claimed successfully`);
         chatObj["isGiven"] = true;
       }

       resolve();
     });
   });
};






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
    pub: "0xD5acA83B8aBcDC89ED18c82b12518fFcd534c684",  //7
    prv: "8453584a8b68456fb7d7fac8470ea974a48d6c6f99bdb7d174e9e46ca5d02e2b",
  },

  {
    pub: "0x8309E5a8F848C2f2964B31F5219704f5d1316089",  //8
    prv: "9e089615e514f8b3dd9f7ade2b14910447d483e15e3b5c00c0df1cca19cc6349",
  },

  {
    pub: "0x67EaE03Bfe0eAB5291ebE427cAFDec98068AC7D0",  //9
    prv: "a593155fe8620853283c794782de047e141901c2912205eb236ee50d3e7b90ea",
  },
];
