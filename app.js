//REF: https://github.com/sendgrid/sendgrid-nodejs

// DEPENDENCIES
const express = require("express");
const bodyParser = require("body-parser"); //(REF: https://expressjs.com/en/resources/middleware/body-parser.html)
const sgMail = require("@sendgrid/mail");

require("dotenv").config();

// Pull in SendGrid API key from local ENV variables
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const app = express();

// Display index.html from the root URL
app.get("/", (request, response) =>
  response.sendFile(`${__dirname}/index.html`)
);

// SEND EMAIL WITH CONTACT FORM DATA
var SENDGRID_TO_EMAIL = process.env.SENDGRID_TO_EMAIL;
var SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

app.post("/api/send", (req, res) => {
  const postBody = req.body;
  // Logging data sent from client POST request
  //console.log("client POST request body: ", postBody);

  // Define placeholder variables for email message in plain text and html formats
  var msgTxt = "";
  var msgHtml = "";
  var greeting =
    "Thanks for testing my contact form. You are receiving this email as a demonstration of how the app works. You will see the info you submitted below. Have a great day!";

  // Get email data
  if (postBody.name) {
    msgTxt += "Name: " + postBody.name + "\n";
    msgHtml += "<strong>Name</strong>: " + postBody.name + "<br/><br/>";
  }

  if (postBody.email) {
    msgTxt += "Email: " + postBody.email + "\n";
    msgHtml += "<strong>Email</strong>: " + postBody.email + "<br/><br/>";
  }

  if (postBody.phone) {
    msgTxt += "Phone: " + postBody.phone + "\n";
    msgHtml += "<strong>Phone</strong>: " + postBody.phone + "<br/><br/>";
  }

  if (postBody.message) {
    msgTxt += "Message: \n" + postBody.message + "\n";
    msgHtml += "<strong>Message</strong>:<br/><p>" + postBody.message + "</p>";
  }

  // Store email data to an object for sending via SendGrid
  const emailData = {
    to: SENDGRID_TO_EMAIL,
    from: SENDGRID_FROM_EMAIL,
    cc: req.body.email ? req.body.email : SENDGRID_TO_EMAIL,
    subject: postBody.subject
      ? postBody.subject
      : "New Website Contact Form Message",
    text: greeting + "\n" + msgTxt,
    html: greeting + "<br/><br/>" + msgHtml
  };

  // Logging data we're sending to SendGrid API
  console.log("emailData:", emailData);

  // Send email with user's submitted data
  sgMail
    .send(emailData)
    .then(() => {
      res
        .status(200)
        .send("Success!")
        .end();
    })
    .catch(e => {
      console.error(e.toString());
      res.status(500).end();
    });
});

// Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log("Press Ctrl+C to quit.");
  console.log(`View contact form on localhost:${PORT}`);
});
