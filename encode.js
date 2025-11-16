const fs = require("fs");
const key = fs.readFileSync("./b12-a10-plateshare-firebase-adminsdk-fbsvc-947e0c9aad.json", "utf8");
const base64 = Buffer.from(key).toString("base64");
console.log(base64);