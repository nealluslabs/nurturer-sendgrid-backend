const express = require('express');
const router = express.Router();
const axios = require('axios');
const lzjs = require('lzjs');
const { compress, decompress } = require('shrink-string')
const { v4: uuidv4 } = require('uuid');
const translate = require('translate-google-api');
require('dotenv').config();
const openai = require('openai');







router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Access-Control-Allow-Headers', '*');
    next();
  });

const getOMAccessToken =  "https://api.orange.com/oauth/v3/token";
const orangeWebPayment =  "https://api.orange.com/orange-money-webpay/gn/v1/webpayment";
const orangeConfirmPayment = "https://api.orange.com/orange-money-webpay/gn/v1/transactionstatus";


const headers = {
  'Content-Type': 'application/x-www-form-urlencoded',
  'Access-Control-Allow-Origin': '*',  
  'Authorization' :`Basic ${process.env.ORANGE_AUTHORIZATION_API_KEY}`

};




router.post('/googletranslate', async (req, res) => {
  const reed_key = process.env.REED_KEY

 const reed_url = `https://www.reed.co.uk/api/1.0/search?keywords=${encodeURIComponent(req.params.jobTitle)}`
  const headers = {
    'Authorization': `Bearer `+`${reed_key}`,
    // Authorization: `Bearer `+`${Buffer.from(reed_key).toString('base64')}`,
    'password':'',
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  
   
  };

 
  
  console.log("TRANSLATE URL IS HIT-->");
try {
  const response = await translate(req.body.string, {
    tld:"com",
    to: "en",
  })

  console.log("RESPONSE DATA IS--->",response);

  return res.json(response);
} catch (error) {
  console.log("ERROR IS ACTUALLY___", error);
  return res.status(500).json({ error: 'Internal Server Error' });
}
});













router.post('/chatgpt', async (req, res) => {
  const openAI = new openai({apiKey:process.env.openAIKey});

 
  const prompt = req.body.prompt;

  console.log("OUR PROMPT IS-->",prompt)

  try {
    const response = await openAI.chat.completions.create({
      messages: [{ role: "system", content:prompt }],
      model: "gpt-3.5-turbo",
    });

  console.log("BACKEND RESPONSE FROM CHAT GPT--->",response.choices[0])

    res.json({ text: response.choices[0].message.content});
  } catch (error) {
    console.error(error);
    res.json({ error: 'An error occurred while processing your request.' });
  }

 
});










module.exports = router;



