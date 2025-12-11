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







app.listen(port, () => {
  console.log(`Proxy server listening at http://localhost:${port}`);
});
