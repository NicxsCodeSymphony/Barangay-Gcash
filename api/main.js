const express = require('express')
const admin = require('firebase-admin')
const bodyParser = require("body-parser");
const cors = require('cors')
const http = require('http')
const socketIO = require('socket.io')
const multer = require('multer')
const nodemailer = require('nodemailer')
const serviceAccount = require("./key.json");
require('dotenv').config()

const { google } = require('googleapis');
const { Readable } = require('stream');
const path = require('path');
const fs = require('fs');


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE,
  });

const app = express()
const server = http.createServer(app)

app.use(cors({
    origin: '*',
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}))

const io = socketIO(server, {
    cors: {
        origin: '*',
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"]
    }
})

app.use(bodyParser.json());

io.on("connection", (socket) => {
    console.log("New client connected: ", socket.id )

    socket.on("disconnect", () => {
        console.log("Client disconnected: ", socket.id)
    })
})


////////////////////////////////////////////////////////// QUERIES /////////////////////////////////////////////////////

const residentsRoute = require('./routes/residents.js')
const officialsRoute = require('./routes/officials.js')
const loginRoute = require('./routes/login.js')
const documentRoute = require('./routes/document.js')

app.use('/residents', residentsRoute)
app.use('/officials', officialsRoute)
app.use('/login', loginRoute)
app.use('/document', documentRoute)



const upload = multer({storage: multer.memoryStorage()})


const auth = new google.auth.GoogleAuth({
    credentials: {
       type: "service_account",
  project_id: "barangaysystem-66fae",
  private_key_id: "e33079e23cf63bd122bfbb8c680bcafb8401d6ea",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC5IK1mWbBVzJKO\nmGEE7IFzWJNMWom1m/aKz9ZryFSR4Y+bhKHsznKlKHBAMhbcFoRH1LQhw5vdfzZp\nJ1/epw8hXTJsZwxZlnISNKfajPTSH7lqeDm/uUKRkdKtM7hnSFqUOztumAyek/R2\ns9GIxJJNlO9wxd7KqJ7yGORSRyC/B5B0+Er58xmI21lvHJ16G+7jVlk2/wM+gifK\nzXz72VbuzcuNXtPTdoAR/Q8B4pkqLBnKKbqxd/fF6a7bbw0EPY2II7x4BlXOeBXg\nHjlThS6tY97fUdCUgLryQdk/jUiodz0Z6HSEZIfTluMlB4eFqE5aG0DkiiN01W2A\ntItzk8t/AgMBAAECggEAKoKXbr4/oKQWL0pMVP4eB6eaQ1ky8BH9PgjVuvBIgysh\nd9uv9xm897HefM9Dsow1Ge1845fwTZ9tlh3lhNIlxkqJTp0nF9dVIFsZBDWD7lA8\nmnc7A4x9/cFXeFA9EvJpYkprrkyZ8TwWUb+e6OICmnANv36gVzb7MKqIm2Ab4+Fr\nwCmj3qmpWsX7ynXbXqm/g1qd36Nb3nVOI9Cugbh2XnB5i2pwn4+KSszYZ8NTM5Pq\nffJg0PX2pvfcF8R/aUnWPxQ+GNVjxTL/sImOMh56o/KPsVi0w8SMk2KIf1Um/t53\nKZy4bQjdXWZGTE7/spsqgFmAYvhqnfz8Qd3gEHizUQKBgQDhIxIyAVqKTmoln8XB\nveb9uXXRw62TIYyl4RWfCVycSTBaFjv27cpsMMmHu452+btobVUD2fwKKVxac318\nweIkCsxicLNJGLZXR1TduTLYkodSEMLzj7RP4MK5Hhz6iJSdZfAf29uf1eas33vm\nC/zc9huYqS2eJp+Ld+fvG7ycuQKBgQDSgYXzRPMgU1c3gsLmEa+BBlJYsxsUMDIS\n5YCku2fjk8pAL6OIvkWN5P4PHXBFQDDDkRu0n+DpodEZ036mh8Zv0bU7oORu57A1\nPXeBRVtSgiHpD0Lw4TBengpYqSjAPBCWWHgmxD2tJSSoeWg/YQXfQauTZvsws9MU\nDKzv7gS99wKBgD7rmk43aqJ0v928BXzcIg6PIop5ca1JFxHVEkHcT/Gt0sGarS+Z\nzZTnHau9k1dU/Dd3NudYqMP+Qz1UQaH4XcdM7UolzTWEnpFN8j31YGx+pyscXB/N\n7crVOhaaf+bU/RPwRWfh/kNxeIKgAvSMLSNj9Np5jbJBgR1taXi9+7yhAoGBALyh\n0k2vQIp8BBC7PTj7KiDdcFcJkD9j/MsQG1oCkVLOcZNY3RtBHYTMaZlT0PJNViU5\nV/FgvyO8nGqfKcPCsWAsNFINmAWF2lGrFfaiFvZ1pDt7MIo30KdIyY6vbtPsPxTq\njCh4+6e3PAU4XeFFaQSpjT1WL8txqLkzrpiF2nv7AoGBANUmnrzs/nmXFgKKBjiP\nGLZKjy415p1meowZB47JM4jI0LKU1rScEZFsyb0rFawxdzPFrvDAaVyQCqEWqAJ6\nM9+404kps4FOq05JPQFB5an5V4VUElZwo22Eo3kJCiJcLleH3jmvia2oS47n5+b7\n+CJqlx5/illqlwM6y6K/vqfc\n-----END PRIVATE KEY-----\n",
  client_email: "barangaygcash@barangaysystem-66fae.iam.gserviceaccount.com",
  client_id: "105021316690806541416",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/barangaygcash%40barangaysystem-66fae.iam.gserviceaccount.com",
//   "universe_domain": "googleapis.com"
    },
    scopes: ["https://www.googleapis.com/auth/drive.file"],
});

const drive = google.drive({ version: "v3", auth });
const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;


const deleteOldImage = async (oldImageUrl) => {
    if (!oldImageUrl) return;

    const match = oldImageUrl.match(/id=([a-zA-Z0-9_-]+)/);
    if (!match) return;

    const oldFileId = match[1];

    try {
        await drive.files.delete({ fileId: oldFileId });
        console.log(`Deleted old image: ${oldFileId}`);
    } catch (error) {
        console.error(`Failed to delete old image: ${oldFileId}`, error);
    }
};

app.post("/upload", upload.any(), async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
    }

    try {
        let uploadedFiles = {};
        let previousPaths = req.body;

        for (const file of req.files) {
            const fieldName = file.fieldname;
            const existingImageKey = `existing${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}`;

            if (previousPaths[existingImageKey]) {
                await deleteOldImage(previousPaths[existingImageKey]);
            }

            const bufferStream = Readable.from(file.buffer);
            const response = await drive.files.create({
                requestBody: {
                    name: file.originalname,
                    parents: [FOLDER_ID],
                },
                media: {
                    mimeType: file.mimetype,
                    body: bufferStream,
                },
                fields: "id",
            });

            await drive.permissions.create({
                fileId: response.data.id,
                requestBody: { role: "reader", type: "anyone" },
            });

            uploadedFiles[fieldName] = `https://drive.google.com/uc?id=${response.data.id}`;
        }

        Object.keys(previousPaths).forEach((key) => {
            if (key.startsWith("existing")) {
                const originalKey = key.replace("existing", "").charAt(0).toLowerCase() + key.replace("existing", "").slice(1);
                if (!uploadedFiles[originalKey]) {
                    uploadedFiles[originalKey] = previousPaths[key];
                }
            }
        });

        res.status(200).json({ message: "Files uploaded successfully", filePaths: uploadedFiles });
    } catch (error) {
        console.error("Upload failed:", error);
        res.status(500).json({ error: "Upload failed" });
    }
});

app.post('/send-email', upload.single('attachment'), async (req, res) => {
    try {
        const { to, subject, message } = req.body;
        const attachment = req.file;

        if (!to || !subject || !message) {
            return res.status(400).json({ success: false, message: 'Missing required fields: to, subject, or message' });
        }

        console.log(to)

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'nicxsician@gmail.com',  
                pass: 'iiah nvsq lxtk rwpm'    
            }
        });

        const info = await transporter.sendMail({
            from: 'nicxsician@gmail.com', 
            to,                           
            subject,                     
            text: message,                
            attachments: [
                {
                    filename: 'barangay_certification.pdf',
                    content: attachment.buffer
                }
            ]
        });

        res.json({ success: true, messageId: info.messageId });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});


const errorHandler = (err, req, res, next) => {
    console.error(err)
    res.status(500).send({error: "Internal Server Error"})
}

app.use(errorHandler)

server.listen(process.env.PORT, () => {
    console.log(`Server started on port ${process.env.PORT}`)
})