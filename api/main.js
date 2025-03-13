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