const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const https = require("https");
 sslRootCAs = require('ssl-root-cas')
sslRootCAs.inject()
require('dotenv').config();

const omRoute = require('./om');

const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);


const app = express();
const port = process.env.PORT||5008;


const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

app.use(bodyParser.json());
app.use('/api/om', omRoute);
app.use(cors({
  origin:'*' /*'https://bonecole-student.netlify.app/'*/,
methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
}));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', '*');
  res.header('Access-Control-Allow-Headers', '*');
  next();
});

const developerPrimaryKey = process.env.MTN_DEVELOPER_PRIMARY_KEY  /*----> WORKING SANDBOX PRIMARY KEY--->*/



const xReferenceId = process.env.MTN_X_REFERENCE_ID     // ---> SANDBOX X REFERENCE  <-- ALSO STORE THIS IN AN ENV VARIABLE


const momoApiKeyUrl = `https://proxy.momoapi.mtn.com/v1_0/apiuser/${xReferenceId}/apikey`
const momoTokenUrl = "https://proxy.momoapi.mtn.com/collection/token";
const momoTokenUrl2 = "https://proxy.momoapi.mtn.com/collection/token/";
const momoRequestToPayUrl = "https://proxy.momoapi.mtn.com/collection/v1_0/requesttopay";
const productionApiKey=  process.env.MTN_PRODUCTION_API_KEY //<--- STORE INSIDE ENVIRONMENT VARIABLE WHEN NEXT U WANNA PUSH  29/11/2023



/*============     0*/
app.post('/api/send-email', async (req, res) => {



  try {
    const { to, subject, htmlMessage } = req.body;

    const msg = {
      to,
      from: "info@nurturer.ai",
      subject,
      text: "This email contains HTML content.",
      html: htmlMessage     // <-- insert the HTML from the frontend
    };

    await sgMail.send(msg);

    res.status(200).json({ success: true, message: "Email sent!" });

  } catch (error) {
    console.error("SendGrid Error:", error);
    if (error.response) console.error(error.response.body);

    res.status(200).json({ success: false, message: "Failed to send email." });
  }



})




/*============     1*/
app.post('/api/get-token', async (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
    const {} = req.body;
    console.log("GET TOKEN URL HAS BEEN HIT")
  try {

    /* const apiKey = await axios.post(momoApiKeyUrl,{httpsAgent},{
      headers: {
        'X-Reference-Id':xReferenceId,
        'Ocp-Apim-Subscription-Key':developerPrimaryKey, 
        'Content-Type': 'application/json',
},
     })*/

     console.log("THE API KEY IS-->",productionApiKey)



 const modAuth =`${xReferenceId}:${productionApiKey}`
 // const base64data = Buffer.from(`${xReferenceId}:${apiKey.data.apiKey}`).toString('base64')



    const response = await axios.post(momoTokenUrl2,{},
   {
       headers: {
        'Content-Type': 'application/json',
       'X-Reference-Id':xReferenceId,
        'Ocp-Apim-Subscription-Key':developerPrimaryKey,
        'Authorization':`Basic `+`${btoa(modAuth)}`
      }   
    });

    console.log("THE AUTH TOKEN IS-->",response.data)

    return res.json(response.data);
  } catch (error) {
    console.log("ERROR___", error);
    return res.status(500).json({ error:error.message });
  }
});

/*============     2*/

app.post('/api/requesttopay', async (req, res) => {
  res.header('Access-Control-Allow-Origin','*');
  const { momoToken, ...restOfBody } = req.body;
  const myUuid = uuidv4();
  console.log("TAKE NOTE OF THIS UUID------>",myUuid)
  console.log("GET REQUEST TO PAY URL HAS BEEN HIT, MOMO TOKEN IS -->",momoToken)
  try {
    if (!momoToken) {
        return res.status(400).json({ error: 'MoMo token not available' });
      }
     await axios.post(momoRequestToPayUrl, restOfBody, {
      headers: {
        'X-Reference-Id': myUuid,
        'X-Target-Environment': 'mtnguineaconakry',
        'Ocp-Apim-Subscription-Key':developerPrimaryKey,
        'Content-Type': 'application/json',
},
    });


    return res.json({payerReferenceId:myUuid});

  } catch (error) {
   // console.log("ERROR__", error);
    return res/*.status(500)*/.json({ error:error.message });
  }
});


/*============     3*/


app.post('/api/paystatus', async (req, res) => {
  res.header('Access-Control-Allow-Origin','*');

  const { momoToken,payerReferenceId} = req.body;

setTimeout(async()=>{
  const response2 = await axios.get(`https://proxy.momoapi.mtn.com/collection/v1_0/requesttopay/${payerReferenceId}`, {
    headers: {
      'X-Reference-Id': payerReferenceId,
      'X-Target-Environment': 'mtnguineaconakry',
      'Ocp-Apim-Subscription-Key':developerPrimaryKey,
      'Authorization': `Bearer ${momoToken}`,
      'Content-Type': 'application/json',
},
  });



  console.log("RESPONSE___", response2);
  return res.json(response2.data);
}
,1000)



})



/*============    4 */

app.post('/api/twoaction', async (req, res) => {
  res.header('Access-Control-Allow-Origin','*');
  const { momoToken, ...restOfBody } = req.body;


  const myUuid = uuidv4();
  console.log("TAKE NOTE OF THIS UUID------>",myUuid)
  console.log("GET REQUEST TO PAY URL HAS BEEN HIT, MOMO TOKEN IS -->",momoToken)
  try {
    if (!momoToken) {
        return res.status(400).json({ error: 'MoMo token not available' });
      }
     await axios.post(momoRequestToPayUrl, restOfBody, {
      headers: {
        'X-Reference-Id': myUuid,
        'X-Target-Environment': 'mtnguineaconakry',
        'Ocp-Apim-Subscription-Key':developerPrimaryKey,
        'Authorization': `Bearer ${momoToken}`,
        'Content-Type': 'application/json',
},
    }
  
    
    ).then(()=>{
  
      setTimeout(async()=>{
        const response2 = await axios.get(`https://proxy.momoapi.mtn.com/collection/v1_0/requesttopay/${myUuid}`, {
          headers: {
            'X-Reference-Id': myUuid,
            'X-Target-Environment': 'mtnguineaconakry',
            'Ocp-Apim-Subscription-Key':developerPrimaryKey,
            'Authorization': `Bearer ${momoToken}`,
            'Content-Type': 'application/json',
      },
        });
      
      
      
        console.log("RESPONSE___", response2);
        return res.json(response2.data);
      }
      ,1000)

    })


   // return res.json({payerReferenceId:myUuid});

  } catch (error) {
   // console.log("ERROR__", error);
    return res/*.status(500)*/.json({ error:error.message });
  }

})



app.listen(port, () => {
  console.log(`Proxy server listening at http://localhost:${port}`);
});
