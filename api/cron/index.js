

const admin = require('firebase-admin');
//import admin from 'firebase-admin'

const openai = require('openai');
//const axios = require('axios');

//import axios from 'axios'
const axios = require('axios/dist/node/axios.cjs'); 
const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

//import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const sesClient = new SESClient({
  region: "eu-north-1", // e.g. "us-east-1" - come and remove these environemt variables before pushing o !
credentials: {
  accessKeyId:process.env.REACT_APP_ACCESSKEYID_NURTURER,
  secretAccessKey:process.env.REACT_APP_SECRETACCESSKEY_NURTURER,
},
});

//export const dynamic = "force-dynamic";

if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.PROJECT_ID,
        clientEmail: process.env.CLIENT_EMAIL,
        privateKey: process.env.REACT_APP_PRIVATE_KEY
          ? process.env.REACT_APP_PRIVATE_KEY.replace(/\\n/gm, "\n")
          : undefined,
      }),
    });
  }
  
  const db = admin.firestore();
 // db.settings({ ignoreUndefinedProperties: true });

  
//import { db, fb, auth, storage } from 'src/config/firebase';



//// 🔹 Runs BEFORE any request is sent
//axios.interceptors.request.use(
//  config => {
//    sentOut = true; // ✅ Marks that the request was initiated
//    console.log('📤 Request initiated to:', config.url);
//    return config;
//  },
//  error => {
//    console.error('❌ Failed to initiate request:', error.message);
//    return Promise.reject(error);
//  }
//);



module.exports = async function handler(req, res) {

  let sentOut = false;
 let emailSendingError = false
let initialSentInPrompt;
let atLeastOneContactwasGeneratedFor = false;
let generatedContacts = [];


  try {

    console.log("Cron job triggered at:", new Date().toISOString());
    let adminSettings
                                       //later I will remove this hardcoding
    await db.collection("adminSettings").doc("KjE2Xz7avxs3Y5w4eXXF").get().then((doc)=>{
     if(doc.exists){
      adminSettings = doc.data()
     }
    });


//** AI MESSAGE GENERATIOR HELPER FUNCTION */


const generateAiMessage = async(messageType,Frequency,Name,JobTitle,Company,Industry,Interests,previousMessage,adminSettingsTriggerDays) =>  {
            
 


  //AUG 29TH 2025 - USUALLY PROMPTS WILL BE EMAILS, BUT OCCASSIONALLY IF IT'S THE CONTACTS BIRTHDAY, OR A HOLIDAY, THEN A HOLIDAY PROMPT WILL BE SENT OUT
  //FOR NOW THOUGH WE WILL CHANGE THE PROMPT BASED ON THE MESSAGE TYPE BEING PASSED IN

 //const apiEndpoint =`https://nurturer-helper-api.vercel.app/api/om/chatgpt`
const apiEndpoint =`https://pmserver.vercel.app/api/om/chatgpt`

//console.log("USER BEING PASSED INTO GENERATE AI MESSAGE--->",user)
const prompt = 
messageType === "Independence"?

eval('`' + adminSettings.holidayQuery.replace(/\{\$/g, '${') + '`')

:

messageType === "Christmas"?

eval('`' + adminSettings.holidayQuery.replace(/\{\$/g, '${') + '`')


  :


  messageType === "New Years"?

 
  eval('`' + adminSettings.holidayQuery.replace(/\{\$/g, '${') + '`')

 
    :
    messageType === "Thanksgiving"?

 
  eval('`' + adminSettings.holidayQuery.replace(/\{\$/g, '${') + '`')

 
    :
    messageType === "Labor Day"?

 
  eval('`' + adminSettings.holidayQuery.replace(/\{\$/g, '${') + '`')

 
    :

    messageType === "Memorial Day"?

 
  eval('`' + adminSettings.holidayQuery.replace(/\{\$/g, '${') + '`')

 
    :

messageType === "Birthday"?


eval('`' + adminSettings.birthdayQuery.replace(/\{\$/g, '${') + '`')

:
 eval('`' + adminSettings.emailQuery.replace(/\{\$/g, '${') + '`')



 //const jobResponse = await axios.post(apiEndpoint,{prompt:prompt})
console.log("THE PROMPT BEING PASSED INTO OPEN AI--->", eval('`' + adminSettings.emailQuery.replace(/\{\$/g, '${') + '`'))

    try {
      const openAI = new openai({apiKey:process.env.openAIKey});
       let jobResponse  /*await axios.post(apiEndpoint, { prompt });*/

      /**CALLING OPEN AI DIRECTLY */
      

          try {
          
            initialSentInPrompt = prompt



          const response = await openAI.responses.create({
          model: "gpt-4.1-mini",
          input: [
          {
          role: "system",
          content: prompt,
          },
          ],
          tools: [{ type: "web_search" }] ,
          });
          console.log("BACKEND RESPONSE FROM CHAT GPT --->", response.output_text);

           //assign the variables here, to know that function has
         
          sentOut = true

          //assign variables end
          
          function extractJSON(text) {
          try {
          // Step 1: Remove Markdown code fences (```json ... ```)
          const cleaned = text
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();
          // Step 2: Try parsing
          return JSON.parse(cleaned);
          } catch (error) {
          console.error("❌ Failed to parse JSON:", error.message);
          // Step 3: Try to recover — find JSON-like substring
          const match = text.match(/\{[\s\S]*\}/);
          if (match) {
          try {
          return JSON.parse(match[0]);
          } catch (innerErr) {
          console.error("❌ Still invalid JSON:", innerErr.message);
          }
          }
          return null; // fallback
          }
          }
          // Example usage:
          const rawResponse = response.output_text; // or response.choices[0].message.content
          const jsonData = extractJSON(rawResponse);
          console.log("✅ Parsed JSON:", jsonData);
          jobResponse = jsonData;
          
          } catch (error) {
          console.error("❌ Error sending to OpenAI:", error);
          res.status(500).json({ error: error/*"An error occurred while processing your request."*/ });
          }





     /* CALLING OPEN AI DIRECTLY END */


    
        console.log("✅ OpenAI API call succeeded:");

        console.log("OUR RESPONSE FROM OUR BACKEND, WHICH CALLS CHAT GPT-->",jobResponse/*.data*/)

    const fullJobDetailsResponse = /*JSON.parse(jobResponse.data)*/jobResponse/*.data*/

    if(fullJobDetailsResponse){


      return {...fullJobDetailsResponse,createdAt:new Date(),messageStatus:"Pending"}

    }
      
      
    } catch (error) {
      // This block runs if the request fails
      if (error.response) {
        // The server responded but returned an error status code (e.g. 429, 500)
        console.error("❌ OpenAI API call failed:", error.response.status, error.response.statusText);
        console.error("Response data:", error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("⚠️ No response received from OpenAI API:", error.request);
      } else {
        // Something happened while setting up the request
        console.error("🚨 Error setting up request:", error.message);
      }
    
      // Optionally: you can also log the timestamp
      console.error("🕒 Error occurred at:", new Date().toISOString());
    }
    



}

    /** AI GENERATOR END */
  
    const snapshot = await db.collection("contacts").get();
  
    if (snapshot.empty) {
      return res.status(200).json({ message: "No contacts found." });
    }
  
    let batch = db.batch();
    let contactsLog = [];
     let totalUsersAffected = 0;

    let writeCount = 0;
    let committedBatches = 0;
  
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const contacterId = data.contacterId;
  
      const userDoc = await db.collection("users").doc(contacterId).get();
      if (!userDoc.exists) {
        console.log(`No user found for contacterId: ${contacterId}`);
        continue;
      }

      //MY SETUP VARIABLES FOR BIRTHDAY
      const birthdayParts = data &&  data.birthday && data.birthday.includes('/')? data.birthday.split('/'): ('1/1/1980').split('/') ; // Split the date string (DD/MM/YYYY)
      const birthday = new Date(birthdayParts[2], birthdayParts[1] - 1, birthdayParts[0]); // Create a Date object
      const currentDate = new Date(); // Today's date

    // Calculate the difference in time (in milliseconds)
    const timeDifferenceBirthday = birthday - currentDate;

  // Convert the difference from milliseconds to a number (e.g., days, hours, etc.)
  const currentBirthdaySendDateNum = timeDifferenceBirthday; // In milliseconds

  const currentBirthdaySendDateNumInDays = Math.floor(timeDifferenceBirthday / (1000 * 60 * 60 * 24));

 //MY SETUP VARIABLES FOR BIRTHDAY - END


// MY SETUP VARIABLES FOR HOLIDAYS

// Define the holiday dates for the current year
const currentYear = currentDate.getFullYear();

// Christmas: December 25
const christmas = new Date(currentYear, 11, 25); // Month is 0-indexed, so 11 = December

// New Year's Day: January 1
const newYearsDay = new Date(currentYear+1, 0, 1);

// Independence Day: July 4
const independenceDay = new Date(currentYear, 6, 4); // 6 = July

// Memorial Day (last Monday in May)
const memorialDay = (() => {
  let d = new Date(currentYear, 4, 31); // May 31
  let day = d.getDay();
  return new Date(currentYear, 4, 31 - day); // Back up to Monday
})();

// Labor Day (first Monday in September)
const laborDay = (() => {
  let d = new Date(currentYear, 8, 1); // September 1
  let day = d.getDay();
  return new Date(currentYear, 8, day === 0 ? 2 : 9 - day); 
})();

// Thanksgiving (4th Thursday in November)
const thanksgiving = (() => {
  let d = new Date(currentYear, 10, 1); // November 1
  let day = d.getDay();
  let firstThursday = day <= 4 ? 4 - day : 11 - day;
  return new Date(currentYear, 10, firstThursday + 21); // + 3 more Thursdays
})();



// Function to get the difference in days (positive number)
const getDaysDifference = (holiday) => {
  const timeDifference = holiday - currentDate;
  return Math.floor(timeDifference / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
};

// Calculate the difference in days for each holiday
const christmasDays = getDaysDifference(christmas);
const newYearsDays = getDaysDifference(newYearsDay);
const independenceDays = getDaysDifference(independenceDay);
const memorialDays = getDaysDifference(memorialDay);
const laborDays =  getDaysDifference(laborDay);
const thanksgivingDays = getDaysDifference(thanksgiving);


// MY SETUP VARIABLES FOR HOLIDAY END
  
      if (data.sendDate && data.frequency && data.frequency !=="None" && adminSettings) {
        const currentSendDateNum = Number(data.sendDate);

        let senderName = "";
        let sender = "";

        const userDoc = await db.collection('users')
          .doc(data.contacterId)
          .get();
        
        if (userDoc.exists) {
          senderName = userDoc.data().name;
          sender = userDoc.data();
        } else {
          senderName = ""; // or fallback values
          sender = "";

        }
        // currentBirthdaySendDateNum = Number(data.birthdaySendDate && data.birthdaySendDate); //not using this
       // const currentHolidaySendDateNum = Number(data.holidaySendDate && data.holidaySendDate);
  
        let updatedSendDate = data.sendDate;
        let updatedBirthdaySendDate =data.birthdaySendDate && data.birthdaySendDate; //dont need this anymore - i am using the contacts birthday
        let updatedHolidaySendDate =data.holidaySendDate && data.holidaySendDate; //dont need this anymore - i am using hardcoded days of july 4, christmans, new years
        let aiGeneratedMessage;
  
        if (currentSendDateNum === (adminSettings && Number(adminSettings.triggerDays)) && data && data.touchesAlert === true ) {
          aiGeneratedMessage = await generateAiMessage(
            "Email", 
            data.frequencyInDays,
            data.name,
            data.jobTitle,
            data.company,
            data.industry,
            data.interests,
            userDoc.data().queryMsg?.find((item) => item.messageType === "Email"),
            adminSettings && Number(adminSettings.triggerDays)
           // userDoc.data(),
           // data
          );

          sentOut = true
           //send email notif to user
           generatedContacts.push({name:data.name,event:"Touches"})
           atLeastOneContactwasGeneratedFor =true
         //send email notif to user end




        }
  
        if (currentBirthdaySendDateNumInDays === (adminSettings && Number(adminSettings.triggerDays))  && data && data.eventsAlert === true) {
          aiGeneratedMessage = await generateAiMessage(
            "Birthday",
            data.birthdayFrequencyInDays,
            data.name,
            data.jobTitle,
            data.company,
            data.industry,
            data.interests,
            userDoc.data().queryMsg?.find((item) => item.messageType === "Birthday"),
            adminSettings && (adminSettings.triggerDays)
           // userDoc.data(),
           // data
          );

          sentOut = true

 //send email notif to user
 generatedContacts.push({name:data.name,event:"Touches"})
 atLeastOneContactwasGeneratedFor =true
//send email notif to user end
        }

        if (christmasDays === (adminSettings && Number(adminSettings.triggerDays)) && data && data.eventsAlert === true  ) {
          aiGeneratedMessage = await generateAiMessage(
            "Christmas",
            data.holidayFrequencyInDays,
            data.name,
            data.jobTitle,
            data.company,
            data.industry,
            data.interests,
            userDoc.data().queryMsg?.find((item) => item.messageType === "Holiday"),
            adminSettings &&  Number(adminSettings.triggerDays)
           // userDoc.data(),
           // data
          );
          sentOut = true

 //send email notif to user
 generatedContacts.push({name:data.name,event:"Christmas"})
 atLeastOneContactwasGeneratedFor =true
//send email notif to user end
       

          //SEND NOTIFICATION EMAIL TO USER

        }
        if (newYearsDays === (adminSettings && Number(adminSettings.triggerDays))  && data && data.eventsAlert === true ) {
          aiGeneratedMessage = await generateAiMessage(
            "New Years",
            data.holidayFrequencyInDays,
            data.name,
            data.jobTitle,
            data.company,
            data.industry,
            data.interests,
            userDoc.data().queryMsg?.find((item) => item.messageType === "Holiday"),
            adminSettings && Number(adminSettings.triggerDays)
          //  userDoc.data(),
          //  data
          );

          sentOut = true
    //send email notif to user
    generatedContacts.push({name:data.name,event:"New Years"})
    atLeastOneContactwasGeneratedFor =true
   //send email notif to user end

        }


        if (thanksgivingDays === (adminSettings && Number(adminSettings.triggerDays))  && data && data.eventsAlert === true ) {
          aiGeneratedMessage = await generateAiMessage(
            "Thanksgiving",
            data.holidayFrequencyInDays,
            data.name,
            data.jobTitle,
            data.company,
            data.industry,
            data.interests,
            userDoc.data().queryMsg?.find((item) => item.messageType === "Holiday"),
            adminSettings && Number(adminSettings.triggerDays)
          //  userDoc.data(),
          //  data
          );

          sentOut = true

   //send email notif to user
   generatedContacts.push({name:data.name,event:"Thanksgiving"})
   atLeastOneContactwasGeneratedFor =true
   //send email notif to user end

        }

        if (laborDays === (adminSettings && Number(adminSettings.triggerDays))  && data && data.eventsAlert === true ) {
          aiGeneratedMessage = await generateAiMessage(
            "Labor Day",
            data.holidayFrequencyInDays,
            data.name,
            data.jobTitle,
            data.company,
            data.industry,
            data.interests,
            userDoc.data().queryMsg?.find((item) => item.messageType === "Holiday"),
            adminSettings && Number(adminSettings.triggerDays)
          //  userDoc.data(),
          //  data
          );

          sentOut = true

   //send email notif to user
   generatedContacts.push({name:data.name,event:"Labor Day"})
   atLeastOneContactwasGeneratedFor =true
 //send email notif to user end

        }

        if (memorialDays === (adminSettings && Number(adminSettings.triggerDays))  && data && data.eventsAlert === true ) {
          aiGeneratedMessage = await generateAiMessage(
            "Memorial Day",
            data.holidayFrequencyInDays,
            data.name,
            data.jobTitle,
            data.company,
            data.industry,
            data.interests,
            userDoc.data().queryMsg?.find((item) => item.messageType === "Holiday"),
            adminSettings && Number(adminSettings.triggerDays)
          //  userDoc.data(),
          //  data
          );

          sentOut = true

 //send email notif to user
 generatedContacts.push({name:data.name,event:"Memorial Day"})
 atLeastOneContactwasGeneratedFor =true
//send email notif to user end

        }


        if ( independenceDays === (adminSettings && Number(adminSettings.triggerDays)) && data && data.eventsAlert === true  ) {
          aiGeneratedMessage = await generateAiMessage(
            "Independence",
            data.holidayFrequencyInDays,
            data.name,
            data.jobTitle,
            data.company,
            data.industry,
            data.interests,
            userDoc.data().queryMsg?.find((item) => item.messageType === "Holiday"),
            adminSettings && Number(adminSettings.triggerDays)
          //  userDoc.data(),
          //  data
          );
           sentOut = true


 //send email notif to user
 generatedContacts.push({name:data.name,event:"Fourth Of July"})
 atLeastOneContactwasGeneratedFor =true
//send email notif to user end

        }
        
        /*else {
          updatedSendDate = String(currentSendDateNum - 1);
         
        }*/
     
        console.log("RAW MESSAGE THAT WAS JUST GENERATED BY AI -->", aiGeneratedMessage);
     

        //may need to shorten this ai prompt so it will work on this free tier CRON
  
        //we are updating the sendDate EVERYDAY, WHETHER AN AI MESSAGE IS GENERATED OR NOT
        updatedSendDate =currentSendDateNum > 1 ? String(currentSendDateNum - 1): String(data.frequencyInDays);

        const updatedMessage = {
          firstParagraph: aiGeneratedMessage?.firstParagraph,
          secondParagraph: aiGeneratedMessage?.secondParagraph,
          thirdParagraph: aiGeneratedMessage?.thirdParagraph,
          bulletPoints: aiGeneratedMessage?.bulletPoints,
          messageStatus:"Pending",
          subject: aiGeneratedMessage?.subject,
          messageType: aiGeneratedMessage?.messageType || "Email",
        };
  
       // console.log("USER BEING UPDATED IS -->", data);
  


        //RELEASING EMAILS WHEN SEND DATE BECOMES ZERO


        if( currentSendDateNum === 1 ){
          //RELEASE EMAIL HERE - THE MOST RECENT ONE IN THE ARRAY THAT HAS TYPE EMAIL


                //THANKSGIVING SENDING


                if(thanksgivingDays===0  &&  data.eventsAlert !==null && data.eventsAlert ===true  ){
                  //RELEASE EMAIL HERE - THE MOST RECENT ONE IN THE ARRAY THAT HAS TYPE HOLIDAY - NO -27 2025 ACTUALLY DO SOME FILTERING OF THE MESSAGE TO SEND!
       
                try {
                 const params = {
                   Destination: {
                     ToAddresses: [data.email],
                   },
                   Message: {
                     Body: {
                       Html: {
                         Data: `
                          
                           <p>Dear <strong>${data.name || ''}</strong>,</p>
                           <br/>
                 
                           <p>${data.messageQueue && data.messageQueue[data.messageQueue.length - 1] && data.messageQueue[data.messageQueue.length - 1].firstParagraph || ''}</p>
                           <br/>
                 
                           <p>${data.messageQueue && data.messageQueue[data.messageQueue.length - 1] && data.messageQueue[data.messageQueue.length - 1].secondParagraph || ''}</p>
                           <br/>
                 
                          
                           <br/>
                 
                           <p>${data.messageQueue && data.messageQueue[data.messageQueue.length - 1] && data.messageQueue[data.messageQueue.length - 1].thirdParagraph || ''}</p>
                           <br/>
      
                           <p>Warm Regards,</p>
                           <p>– ${senderName}</p>
                            
                           <br/>
                           
                           <div style="text-align:left; margin: 20px 0;">
                           <img src="https://nurturer-newsletter.s3.eu-west-3.amazonaws.com/thanksgiving-image-for-email.png"
                                alt="Thanksgiving Card"
                                style="width:300px; height:300px; object-fit:cover;" />
                         </div>
                 
                          
                         `,
                       },
                       Text: {
                         Data: data.messageQueue && data.messageQueue[data.messageQueue.length - 1] && data.messageQueue[data.messageQueue.length - 1].subject || '',
                       },
                     },
                     Subject: {
                       Data: data.messageQueue && data.messageQueue[data.messageQueue.length - 1] && data.messageQueue[data.messageQueue.length - 1].subject || '',
                     },
                   },
                   Source: 'info@nurturer.ai', // must be verified in SES
                 };
                 
                 const command = new SendEmailCommand(params);
                  await sesClient.send(command);
             
                // console.log("✅ Email sent successfully:", response.MessageId);
                // return response;
               } catch (error) {
                 console.error("❌ Error sending email:", error);
                   emailSendingError = true
                 //throw error;
               }
         
               //SEND EMAIL END
       
                 const updatedMessageQueue = [...data.messageQueue];
       
                 // Find the index of the most recent email (assuming array is in chronological order)
                 // If not, we’ll sort it before finding
                 const emailMessages = updatedMessageQueue
                   .map((msg, index) => ({ ...msg, index }))
                   .filter(msg => msg.messageType === "Holiday");
               
                 if (emailMessages.length > 0) {
                   // Get the last (most recent) email
                   const mostRecentEmail = emailMessages[emailMessages.length - 1];
                   const msgIndex = mostRecentEmail.index;
               
                   // Update the messageStatus
                   updatedMessageQueue[msgIndex] = {
                     ...updatedMessageQueue[msgIndex],
                     messageStatus: "Sent",
                   };
       
       
       
                 batch.update(doc.ref, {
                   
                   
                   messageQueue: updatedMessageQueue,
                 });
               }
             }
      
      
                //THANKSGIVING SENDING END

       if(data && data.touchesAlert !==null && data.touchesAlert ===true  ){
          try {
            const params = {
              Destination: {
              ToAddresses: [data.email],
              },
              Message: {
                Body: {
                  Html: {
                    Data: `
                      
                      <p>Dear <strong>${data.name || ''}</strong>,</p>
                      <br/>
            
                      <p>${data.messageQueue && data.messageQueue[data.messageQueue.length - 1] && data.messageQueue[data.messageQueue.length - 1].firstParagraph || ''}</p>
                      <br/>
            
                      <p>${data.messageQueue && data.messageQueue[data.messageQueue.length - 1] && data.messageQueue[data.messageQueue.length - 1].secondParagraph || ''}</p>
                      <br/>
            
                      <ul>
                        ${
                          (data.messageQueue &&
                           data.messageQueue[data.messageQueue.length - 1] &&
                           data.messageQueue[data.messageQueue.length - 1].bulletPoints)
                            ? data.messageQueue[data.messageQueue.length - 1].bulletPoints.map(
                                bp => `
                                  <li>
                                    <strong>${bp.bulletPointBold || ''}</strong> — ${bp.bulletPointRest || ''} 
                                    <a href="${bp.link || '#'}" target="_blank">${bp.link || ''}</a>
                                  </li>`
                              ).join('')
                            : ''
                        }
                      </ul>
                      <br/>
            
                      <p>${data.messageQueue && data.messageQueue[data.messageQueue.length - 1] && data.messageQueue[data.messageQueue.length - 1].thirdParagraph || ''}</p>
                      <br/>
            
                      <p>Warm Regards,</p>
                      <p>– The Nurturer Team</p>
                    `,
                  },
                  Text: {
                    Data: data.messageQueue && data.messageQueue[data.messageQueue.length - 1] && data.messageQueue[data.messageQueue.length - 1].subject || '',
                  },
                },
                Subject: {
                  Data: data.messageQueue && data.messageQueue[data.messageQueue.length - 1] && data.messageQueue[data.messageQueue.length - 1].subject || '',
                },
              },
              Source: 'info@nurturer.ai', // must be verified in SES
            };
            
        
            const command = new SendEmailCommand(params);
             await sesClient.send(command);
        
            //console.log("✅ Email sent successfully:", response.MessageId);
           // return response;
          } catch (error) {
            console.error("❌ Error sending email:", error);
            //throw error;
            emailSendingError = true
          }

          //SEND EMAIL END
    

          const updatedMessageQueue = [...data.messageQueue];

          // Find the index of the most recent email (assuming array is in chronological order)
          // If not, we’ll sort it before finding
          const emailMessages = updatedMessageQueue
            .map((msg, index) => ({ ...msg, index }))
            .filter(msg => msg.messageType === "Email");
        
          if (emailMessages.length > 0) {
            // Get the last (most recent) email
            const mostRecentEmail = emailMessages[emailMessages.length - 1];
            const msgIndex = mostRecentEmail.index;
        
            // Update the messageStatus
            updatedMessageQueue[msgIndex] = {
              ...updatedMessageQueue[msgIndex],
              messageStatus: "Sent",
            };

          batch.update(doc.ref, {
           
            messageQueue: updatedMessageQueue,
          });
        }
      }

        if( currentBirthdaySendDateNum === 0 && data && data.eventsAlert !==null && data.eventsAlert ===true  ){
         //RELEASE EMAIL HERE - THE MOST RECENT ONE IN THE ARRAY THAT HAS TYPE BIRTHDAY

         try {
          const params = {
            Destination: {
              ToAddresses: [data.email],
            },
            Message: {
              Body: {
                Html: {
                  Data: `
                   
                    <p>Dear <strong>${data.name || ''}</strong>,</p>
                    <br/>
          
                    <p>${data.messageQueue && data.messageQueue[data.messageQueue.length - 1] && data.messageQueue[data.messageQueue.length - 1].firstParagraph || ''}</p>
                    <br/>
          
                    <p>${data.messageQueue && data.messageQueue[data.messageQueue.length - 1] && data.messageQueue[data.messageQueue.length - 1].secondParagraph || ''}</p>
                    <br/>
          
                    <ul>
                      ${
                        (data.messageQueue &&
                         data.messageQueue[data.messageQueue.length - 1] &&
                         data.messageQueue[data.messageQueue.length - 1].bulletPoints)
                          ? data.messageQueue[data.messageQueue.length - 1].bulletPoints.map(
                              bp => `
                                <li>
                                  <strong>${bp.bulletPointBold || ''}</strong> — ${bp.bulletPointRest || ''} 
                                  <a href="${bp.link || '#'}" target="_blank">${bp.link || ''}</a>
                                </li>`
                            ).join('')
                          : ''
                      }
                    </ul>
                    <br/>
          
                    <p>${data.messageQueue && data.messageQueue[data.messageQueue.length - 1] && data.messageQueue[data.messageQueue.length - 1].thirdParagraph || ''}</p>
                    <br/>
          
                    <p>Warm Regards,</p>
                    <p>– The Nurturer Team</p>
                  `,
                },
                Text: {
                  Data: data.messageQueue && data.messageQueue[data.messageQueue.length - 1] && data.messageQueue[data.messageQueue.length - 1].subject || '',
                },
              },
              Subject: {
                Data: data.messageQueue && data.messageQueue[data.messageQueue.length - 1] && data.messageQueue[data.messageQueue.length - 1].subject || '',
              },
            },
            Source: 'info@nurturer.ai', // must be verified in SES
          };
          
      
          const command = new SendEmailCommand(params);
           await sesClient.send(command);
      
          //console.log("✅ Email sent successfully:", response.MessageId);
         // return response;
        } catch (error) {
          console.error("❌ Error sending email:", error);
          //throw error;
          emailSendingError = true
        }
  
        //SEND EMAIL END

         const updatedMessageQueue = [...data.messageQueue];

          // Find the index of the most recent email (assuming array is in chronological order)
          // If not, we’ll sort it before finding
          const emailMessages = updatedMessageQueue
            .map((msg, index) => ({ ...msg, index }))
            .filter(msg => msg.messageType === "Birthday");
        
          if (emailMessages.length > 0) {
            // Get the last (most recent) email
            const mostRecentEmail = emailMessages[emailMessages.length - 1];
            const msgIndex = mostRecentEmail.index;
        
            // Update the messageStatus
            updatedMessageQueue[msgIndex] = {
              ...updatedMessageQueue[msgIndex],
              messageStatus: "Sent",
            };

          batch.update(doc.ref, {
           
            messageQueue: updatedMessageQueue,
          });
        }

        }
        if(  christmasDays === 0 && data && data.eventsAlert !==null && data.eventsAlert ===true   ){
           //RELEASE EMAIL HERE - THE MOST RECENT ONE IN THE ARRAY THAT HAS TYPE BIRTHDAY

         try {
          const params = {
            Destination: {
              ToAddresses: [data.email],
            },
            Message: {
              Body: {
                Html: {
                  Data: `
                   
                    <p>Dear <strong>${data.name || ''}</strong>,</p>
                    <br/>
          
                    <p>${data.messageQueue && data.messageQueue[data.messageQueue.length - 1] && data.messageQueue[data.messageQueue.length - 1].firstParagraph || ''}</p>
                    <br/>
          
                    <p>${data.messageQueue && data.messageQueue[data.messageQueue.length - 1] && data.messageQueue[data.messageQueue.length - 1].secondParagraph || ''}</p>
                    <br/>
          
                    <ul>
                      ${
                        (data.messageQueue &&
                         data.messageQueue[data.messageQueue.length - 1] &&
                         data.messageQueue[data.messageQueue.length - 1].bulletPoints)
                          ? data.messageQueue[data.messageQueue.length - 1].bulletPoints.map(
                              bp => `
                                <li>
                                  <strong>${bp.bulletPointBold || ''}</strong> — ${bp.bulletPointRest || ''} 
                                  <a href="${bp.link || '#'}" target="_blank">${bp.link || ''}</a>
                                </li>`
                            ).join('')
                          : ''
                      }
                    </ul>
                    <br/>
          
                    <p>${data.messageQueue && data.messageQueue[data.messageQueue.length - 1] && data.messageQueue[data.messageQueue.length - 1].thirdParagraph || ''}</p>
                    <br/>
          
                    <p>Warm Regards,</p>
                    <p>– The Nurturer Team</p>
                  `,
                },
                Text: {
                  Data: data.messageQueue && data.messageQueue[data.messageQueue.length - 1] && data.messageQueue[data.messageQueue.length - 1].subject || '',
                },
              },
              Subject: {
                Data: data.messageQueue && data.messageQueue[data.messageQueue.length - 1] && data.messageQueue[data.messageQueue.length - 1].subject || '',
              },
            },
            Source: 'info@nurturer.ai', // must be verified in SES
          };
          
      
          const command = new SendEmailCommand(params);
         await sesClient.send(command);
      
         // console.log("✅ Email sent successfully:", response.MessageId);
         // return response;
        } catch (error) {
          console.error("❌ Error sending email:", error);
          //throw error;
          emailSendingError = true
        }
  
        //SEND EMAIL END


          const updatedMessageQueue = [...data.messageQueue];

          // Find the index of the most recent email (assuming array is in chronological order)
          // If not, we’ll sort it before finding
          const emailMessages = updatedMessageQueue
            .map((msg, index) => ({ ...msg, index }))
            .filter(msg => msg.messageType === "Holiday");
        
          if (emailMessages.length > 0) {
            // Get the last (most recent) email
            const mostRecentEmail = emailMessages[emailMessages.length - 1];
            const msgIndex = mostRecentEmail.index;
        
            // Update the messageStatus
            updatedMessageQueue[msgIndex] = {
              ...updatedMessageQueue[msgIndex],
              messageStatus: "Sent",
            };

          batch.update(doc.ref, {
           
           
            messageQueue: updatedMessageQueue,
          });
        }

      }
        if( independenceDays===0 && data && data.eventsAlert !==null && data.eventsAlert ===true  ){
           //RELEASE EMAIL HERE - THE MOST RECENT ONE IN THE ARRAY THAT HAS TYPE BIRTHDAY

         try {
          const params = {
            Destination: {
              ToAddresses: [data.email],
            },
            Message: {
              Body: {
                Html: {
                  Data: `
                   
                    <p>Dear <strong>${data.name || ''}</strong>,</p>
                    <br/>
          
                    <p>${data.messageQueue && data.messageQueue[data.messageQueue.length - 1] && data.messageQueue[data.messageQueue.length - 1].firstParagraph || ''}</p>
                    <br/>
          
                    <p>${data.messageQueue && data.messageQueue[data.messageQueue.length - 1] && data.messageQueue[data.messageQueue.length - 1].secondParagraph || ''}</p>
                    <br/>
          
                    <ul>
                      ${
                        (data.messageQueue &&
                         data.messageQueue[data.messageQueue.length - 1] &&
                         data.messageQueue[data.messageQueue.length - 1].bulletPoints)
                          ? data.messageQueue[data.messageQueue.length - 1].bulletPoints.map(
                              bp => `
                                <li>
                                  <strong>${bp.bulletPointBold || ''}</strong> — ${bp.bulletPointRest || ''} 
                                  <a href="${bp.link || '#'}" target="_blank">${bp.link || ''}</a>
                                </li>`
                            ).join('')
                          : ''
                      }
                    </ul>
                    <br/>
          
                    <p>${data.messageQueue && data.messageQueue[data.messageQueue.length - 1] && data.messageQueue[data.messageQueue.length - 1].thirdParagraph || ''}</p>
                    <br/>
          
                    <p>Warm Regards,</p>
                    <p>– The Nurturer Team</p>
                  `,
                },
                Text: {
                  Data: data.messageQueue && data.messageQueue[data.messageQueue.length - 1] && data.messageQueue[data.messageQueue.length - 1].subject || '',
                },
              },
              Subject: {
                Data: data.messageQueue && data.messageQueue[data.messageQueue.length - 1] && data.messageQueue[data.messageQueue.length - 1].subject || '',
              },
            },
            Source: 'info@nurturer.ai', // must be verified in SES
          };
          
          const command = new SendEmailCommand(params);
           await sesClient.send(command);
      
         // console.log("✅ Email sent successfully:", response.MessageId);
         // return response;
        } catch (error) {
          console.error("❌ Error sending email:", error);
         // throw error;

         emailSendingError = true
        }
  
        //SEND EMAIL END

          const updatedMessageQueue = [...data.messageQueue];

          // Find the index of the most recent email (assuming array is in chronological order)
          // If not, we’ll sort it before finding
          const emailMessages = updatedMessageQueue
            .map((msg, index) => ({ ...msg, index }))
            .filter(msg => msg.messageType === "Holiday");
        
          if (emailMessages.length > 0) {
            // Get the last (most recent) email
            const mostRecentEmail = emailMessages[emailMessages.length - 1];
            const msgIndex = mostRecentEmail.index;
        
            // Update the messageStatus
            updatedMessageQueue[msgIndex] = {
              ...updatedMessageQueue[msgIndex],
              messageStatus: "Sent",
            };



          batch.update(doc.ref, {
            
            
            messageQueue: updatedMessageQueue,
          });
        }
      }

        if( newYearsDays===0 && data &&  data.eventsAlert !==null && data.eventsAlert ===true ){
          //RELEASE EMAIL HERE - THE MOST RECENT ONE IN THE ARRAY THAT HAS TYPE BIRTHDAY

          try {
            const params = {
              Destination: {
                ToAddresses: [data.email],
              },
              Message: {
                Body: {
                  Html: {
                    Data: `
                     
                      <p>Dear <strong>${data.name || ''}</strong>,</p>
                      <br/>
            
                      <p>${data.messageQueue && data.messageQueue[data.messageQueue.length - 1] && data.messageQueue[data.messageQueue.length - 1].firstParagraph || ''}</p>
                      <br/>
            
                      <p>${data.messageQueue && data.messageQueue[data.messageQueue.length - 1] && data.messageQueue[data.messageQueue.length - 1].secondParagraph || ''}</p>
                      <br/>
            
                      <ul>
                        ${
                          (data.messageQueue &&
                           data.messageQueue[data.messageQueue.length - 1] &&
                           data.messageQueue[data.messageQueue.length - 1].bulletPoints)
                            ? data.messageQueue[data.messageQueue.length - 1].bulletPoints.map(
                                bp => `
                                  <li>
                                    <strong>${bp.bulletPointBold || ''}</strong> — ${bp.bulletPointRest || ''} 
                                    <a href="${bp.link || '#'}" target="_blank">${bp.link || ''}</a>
                                  </li>`
                              ).join('')
                            : ''
                        }
                      </ul>
                      <br/>
            
                      <p>${data.messageQueue && data.messageQueue[data.messageQueue.length - 1] && data.messageQueue[data.messageQueue.length - 1].thirdParagraph || ''}</p>
                      <br/>
            
                      <p>Warm Regards,</p>
                      <p>– The Nurturer Team</p>
                    `,
                  },
                  Text: {
                    Data: data.messageQueue && data.messageQueue[data.messageQueue.length - 1] && data.messageQueue[data.messageQueue.length - 1].subject || '',
                  },
                },
                Subject: {
                  Data: data.messageQueue && data.messageQueue[data.messageQueue.length - 1] && data.messageQueue[data.messageQueue.length - 1].subject || '',
                },
              },
              Source: 'info@nurturer.ai', // must be verified in SES
            };
            
            const command = new SendEmailCommand(params);
            await sesClient.send(command);
        
           // console.log("✅ Email sent successfully:", response.MessageId);
           // return response;
          } catch (error) {
            console.error("❌ Error sending email:", error);
            //throw error;
            emailSendingError = true
          }
    
          //SEND EMAIL END

          const updatedMessageQueue = [...data.messageQueue];

          // Find the index of the most recent email (assuming array is in chronological order)
          // If not, we’ll sort it before finding
          const emailMessages = updatedMessageQueue
            .map((msg, index) => ({ ...msg, index })) //CAPTURE THE INDEX B4 FILTERING - GENIUS!
            .filter(msg => msg.messageType === "Holiday");
        
          if (emailMessages.length > 0) {
            // Get the last (most recent) email
            const mostRecentEmail = emailMessages[emailMessages.length - 1];
            const msgIndex = mostRecentEmail.index;
        
            // Update the messageStatus
            updatedMessageQueue[msgIndex] = {
              ...updatedMessageQueue[msgIndex],
              messageStatus: "Sent",
            };



          batch.update(doc.ref, {
            
            
            messageQueue: updatedMessageQueue,
          });
        }
        }
      }

        //RELEASING EMAIL WHEN SEND DATE BECOMES ZERO - END


        if( currentSendDateNum === (adminSettings && Number(adminSettings.triggerDays))||currentBirthdaySendDateNum === (adminSettings && Number(adminSettings.triggerDays))|| christmasDays === (adminSettings && Number(adminSettings.triggerDays)) || independenceDays===(adminSettings && Number(adminSettings.triggerDays)) ||newYearsDays ===(adminSettings && Number(adminSettings.triggerDays)) || thanksgivingDays ===(adminSettings && Number(adminSettings.triggerDays)) || laborDays ===(adminSettings && Number(adminSettings.triggerDays)) || memorialDays ===(adminSettings && Number(adminSettings.triggerDays)) ){
      //WHEN ONE OF THESE DATE IS Number(adminSettings.triggerDays), AN AI MESSAGE WILL BE GENERATED FOR SURE

      console.log("THE USER WE ARE DEALING WITH IS---->", data)
      console.log("THE UPDATED MESSAGE IS---->", updatedSendDate)

    if(aiGeneratedMessage && aiGeneratedMessage.firstParagraph){
   
      batch.update(doc.ref, {
        sendDate: updatedSendDate,
        
        messageQueue: admin.firestore.FieldValue.arrayUnion(updatedMessage),
      });
    }
  }
    
    else{
      console.log("THE USER WE ARE DEALING WITH IS---->", data)
      console.log("THE UPDATED SEND DATE IS---->", updatedSendDate)
      //OTHERWISE , WHEN NONE OF THESE DATES ARE Number(adminSettings.triggerDays), WE ARE NOT UPDATING THE MESSAGE QUEUE, JUST REDUCING THE COUNTDOWN
       batch.update(doc.ref, {
          sendDate: updatedSendDate,
          //birthdaySendDate: updatedBirthdaySendDate,
         // holidaySendDate: updatedHolidaySendDate,
        
        });
      }



      const isTodayHoliday = (christmasDays === 0 || newYearsDays === 0 || independenceDays === 0);
let whichHoliday = "";
if (christmasDays === 0) whichHoliday = "Christmas";
else if (newYearsDays === 0) whichHoliday = "New Years";
else if (independenceDays === 0) whichHoliday = "Independence Day";
else if (laborDays === 0) whichHoliday = "Labor Day";
else if (thanksgivingDays === 0) whichHoliday = "Thanksgiving Day";
else if (memorialDays === 0) whichHoliday = "Memorial Day";

const isHolidayAdminSendDate = (
  christmasDays ===adminSettings &&  Number(adminSettings.triggerDays) ||
  newYearsDays ===adminSettings && Number(adminSettings.triggerDays) ||
  independenceDays ===adminSettings && Number(adminSettings.triggerDays)||
  laborDays ===adminSettings && Number(adminSettings.triggerDays)||
  memorialDays === adminSettings && Number(adminSettings.triggerDays)||
  thanksgivingDays ===adminSettings && Number(adminSettings.triggerDays)
);


/**ADDING TO MY CONTACTS LOG ARRAY  */
const isBirthdayToday = currentBirthdaySendDateNumInDays === 0;

const isSendDateOne = Number(data.sendDate) === 0;

const isSendDateAdminSendDate = Number(data.sendDate) === adminSettings && Number(adminSettings.triggerDays);

contactsLog.push({
  contactName: data.name,
  contactEmail: data.email,
  emailSubject:aiGeneratedMessage?aiGeneratedMessage.subject:"no subject generated",
  generatedMessage:
  {subject:aiGeneratedMessage?aiGeneratedMessage.subject:" ",
  firstParagraph:aiGeneratedMessage?aiGeneratedMessage.firstParagraph:"",
  secondParagraph:aiGeneratedMessage?aiGeneratedMessage.firstParagraph:"",
  },
  
  contactId: data.uid,
  
  previousSendDate: data.sendDate,
  newSendDate: updatedSendDate,
  isTodayHoliday,
  whichHoliday,
  isHolidayAdminSendDate,
  isSendDateOne,
  wasOpenAiRequestSent:sentOut?"yes":"no",
  initialMessagePrompt:initialSentInPrompt?initialSentInPrompt:"",
  wasEmailSentOutToday:isSendDateOne?"yes":"no",
  wasThereEmailSendingError:emailSendingError?"yes":"no",
  didEmailHaveSendingError:emailSendingError?"yes":"no",
  isSendDateAdminSendDate,
  isBirthdayToday
});

totalUsersAffected += 1;

/**ADDING TO MY CONTACTS LOG ARRAY - END */

        writeCount++;
  
        // 🔑 If batch reaches 500 writes, commit and start a new one
        if (writeCount === 500) {
          await batch.commit();
          committedBatches++;
          console.log(`Committed batch #${committedBatches} with 500 writes`); 
          batch = db.batch();
          writeCount = 0;
        }
      }
    }
  
    // Commit any remaining writes
    if (writeCount > 0) {
      await batch.commit();
      committedBatches++;
      console.log(`Committed final batch #${committedBatches} with ${writeCount} writes`);


    }



    if(atLeastOneContactwasGeneratedFor){
      try {
        const params = {
          Destination: {
            ToAddresses: [sender.email],
          },
          Message: {
            Body: {
              Html: {
                Data: `
                 
                  <p>Dear <strong>${sender.name || ''}</strong>,</p>
                  <br/>
  
                  <p>Your Scheduled Messages have been successfully generated for the following contacts</p>
                  <br/>
        
                  <p>
                  ${generatedContacts && generatedContacts.map(contact => 
                    `${contact.name} - ${contact.event}`).join(', ')}
  
                  ))}
                  </p>
                  <br/>
        
                  <p>You can review or edit these messages from your dashboard</p>
                  <br/>
        
                 
                  <br/>
        
                  <p>If you'd like us not to automatically send these messages on your behalf, simply disable your settings, or each contact's settings.</p>
                  <br/>
  
                  <p>Warm Regards,</p>
                  <p>– The Nurturer Team</p>
                   
                  <br/>
                  
               
        
                 
                `,
              },
              Text: {
                Data:'Your messages have been generated',
              },
            },
            Subject: {
              Data:'Your messages have been generated',
            },
          },
          Source: 'info@nurturer.ai', // must be verified in SES
        };
        
        const command = new SendEmailCommand(params);
         await sesClient.send(command);
    
       // console.log("✅ Email sent successfully:", response.MessageId);
       // return response;
      } catch (error) {
        console.error("❌ Error sending email:", error);
        //throw error;
        emailSendingError = true
      }
  
    }
  

    await db.collection("cronlogs").add({
      createdAt: new Date(),
      totalUsersAffected,
      contacts: contactsLog
    });

  
    return res.status(200).json({ message: `Contacts updated successfully. Total batches: ${committedBatches}` });
  
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
  
}





//module.exports = handler;

  
  