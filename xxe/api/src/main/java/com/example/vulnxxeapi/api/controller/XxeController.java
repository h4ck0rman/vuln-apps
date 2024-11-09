package com.example.vulnxxeapi.api.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import java.io.StringReader;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import org.xml.sax.InputSource;
import java.io.StringWriter;

@RestController
public class XxeController {

    @PostMapping("/api/parse-xml")
    public ResponseEntity<String> parseXml(@RequestBody String xml) {
        try {
            // Setting up vulnerable DocumentBuilderFactory
            DocumentBuilderFactory dbFactory = DocumentBuilderFactory.newInstance();

            // do NOT disable XXE processing
            // [insert disabling of XXE processing]
//            dbFactory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", false);
//            dbFactory.setFeature("http://xml.org/sax/features/external-general-entities", false);
//            dbFactory.setFeature("http://xml.org/sax/features/external-parameter-entities", false);

            DocumentBuilder dBuilder = dbFactory.newDocumentBuilder();
            Document rootElement = dBuilder.parse(new InputSource(new StringReader(xml)));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_XML);

            String reflectedXml = createXmlResponse(rootElement);

            // return a response message
            return new ResponseEntity<>(reflectedXml, headers, HttpStatus.OK);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid Request");
        }
    }

    // Method to create XML response with reflected user input
    private String createXmlResponse(Document inputDoc) throws Exception {
        // Create a new document for the response XML
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        DocumentBuilder builder = factory.newDocumentBuilder();
        Document responseDoc = builder.newDocument();

        // Create root element
        Element root = responseDoc.createElement("response");
        responseDoc.appendChild(root);


        // Import and append the user's data into the response XML
        Element userContent = (Element) responseDoc.importNode(inputDoc.getDocumentElement(), true);
        root.appendChild(userContent);

        // Convert Document to String (for returning as ResponseEntity)
        TransformerFactory transformerFactory = TransformerFactory.newInstance();
        Transformer transformer = transformerFactory.newTransformer();
        StringWriter writer = new StringWriter();
        transformer.transform(new DOMSource(responseDoc), new StreamResult(writer));
        return writer.getBuffer().toString();
    }
}
