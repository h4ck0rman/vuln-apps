// app.js
const express = require("express");
const axios = require("axios");
const path = require("path");
const xml2js = require("xml2js");
const escapeHtml = require("escape-html");
const { XMLParser } = require("fast-xml-parser");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3001;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(bodyParser.text({ type: "application/xml" }));

// Home route to display the form
app.get("/", (req, res) => {
  res.render("index", { response: null });
});

// Route to handle form submission and generate XML
app.post("/submit-xml", async (req, res) => {
    // Receive XML data from the form
    const xmlData = req.body; // Assuming XML data is sent in the `xmlData` field
    console.log(xmlData)
    try {
        // Send the XML data to the backend API
        const apiResponse = await axios.post("http://192.168.1.119:8080/api/parse-xml", xmlData, {
            headers: { "Content-Type": "application/xml" },
        });

        // Configure XMLParser with options for better structure handling
        const parserOptions = {
            ignoreAttributes: false,
            attributeNamePrefix: "",
            parseAttributeValue: true,
            parseNodeValue: true,
            trimValues: true
        };

        // Initialize the XML parser with options
        const parser = new XMLParser(parserOptions);
        const jsonObj = parser.parse(apiResponse.data);

        // Access fields in the parsed response
        const form = jsonObj?.response?.form || {};
        const firstname = form?.firstname || "Unknown";
        const lastname = form?.lastname || "Unknown";
        const cId = form?.cId || "Unknown";
        const address = form?.address || "Unknown";

        // Create an object to send as JSON response
        const responseData = {
            firstname,
            lastname,
            cId,
            address,
            status: jsonObj?.response?.status?.success || "false",
        };

        // Send the object as a JSON response
        res.json(responseData);

    } catch (error) {
        //console.error("Error:", error);
        res.status(500).json({ error: "Error: Unable to process the XML input." });
    }
});
  

app.listen(PORT, () => {
  console.log(`Frontend server running on http://localhost:${PORT}`);
});
