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


const FormData =  require("form-data"); // form-data v4.0.1  
const Mailgun =  require("mailgun.js"); // mailgun.js v11.1.0  


const app = express();
const port = process.env.PORT||5008;


const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

app.use(cors({
  origin:'*' ,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));


app.use(bodyParser.json());
app.use('/api/om', omRoute);


app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', '*');
  res.header('Access-Control-Allow-Headers', '*');
  next();
});




/*============     0*/
app.post('/send-email', async (req, res) => {

  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");

  try {
    const { to, subject, htmlMessage } = req.body;

  //  const msg = {
  //    to,
  //    from: "info@nurturer.ai",
  //    subject,
  //    text: "This email contains HTML content.",
  //    html: htmlMessage     // <-- insert the HTML from the frontend
  //  };

   // await sgMail.send(msg);



    async function sendHtmlMessage() {
      const mailgun = new Mailgun(FormData);
      const mg = mailgun.client({
        username: "api",
        key:process.env.MAILGUN_API_KEY,
       url: "https://api.mailgun.net" // use if EU domain
       
      }); 
    
    console.log("TO IS ===>",to)
    console.log("SUBJECT IS ===>",subject)

      try {
        const mailgunData = await mg.messages.create(
          "nurturer.ai",
          { //"Nurturer AI <info@nurturer.ai>"
            from:"Nurturer AI <info@nurturer.ai>",
            to: [to],
            subject,
            text: "Welcome to Nurturer AI! We’re glad to have you.",
            html: htmlMessage,
          }
        );
    
        console.log("Email sent===>:", mailgunData);
      } catch (error) {
       // console.error("Mailgun error:", error);

        console.error("Mailgun error:", error?.message);
        console.error("Mailgun error data:", error?.response?.data);

      }
    }
    
    
    sendHtmlMessage()

    

    res.status(200).json({ success: true, message: "Email sent!" });

  } catch (error) {
    console.error("SendGrid Error:", error);
    if (error.response) console.error(error.response.body);

    res.status(200).json({ success: false, message: "Failed to send email." });
  }



})







app.listen(port, () => {
  console.log(`Proxy server listening at http://localhost:${port}`);
});
