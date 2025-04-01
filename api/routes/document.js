const express = require('express')
const router = express.Router()
const admin = require('firebase-admin')
const db = admin.database()

router.post('/', async (req, res) => {

    const data = req.body

    try{
        const documentId = db.ref().child('document').push().key
        data.documentId = documentId

        await db.ref('document/' + data.documentId).set({...data, status: "Pending"})
        res.send({success: "Document was requested successfully"})
    }
    catch(err){
        console.log(err)
        res.status(500).send({error: "Internal Server Error"})
    }
})

router.get('/', async (req, res) => {
    try {
        const snapshot = await db.ref('document').once('value');
        const documents = snapshot.val();

        const documentWithNames = await Promise.all(Object.keys(documents).map(async (key) => {
            const document = documents[key];

            const residentSnapshot = await db.ref('residents/' + document.residentId).once('value');
            const resident = residentSnapshot.val();  


            return {
                ...document,
                requester_name: `${resident.first_name} ${resident.last_name}`,
                requester_email: resident.email,
                requester_contact: resident.contact_number,
                residentId: resident.residentId,
            };
        }));

        res.send(documentWithNames);
    } catch (err) {
        console.log(err);
        res.status(500).send({ error: "Internal Server Error" });
    }
});

router.get('/resident/:residentId', async (req, res) => {
    const { residentId } = req.params;
    
    try {
        const snapshot = await db.ref('document').orderByChild('residentId').equalTo(residentId).once('value');
        const documents = snapshot.val();
        
        if (!documents) {
            return res.send([]);
        }
        
        // Convert the object to an array and sort by requestDate in descending order
        const documentArray = Object.keys(documents).map(key => ({
            ...documents[key],
            documentId: key
        }));
        
        // Sort by requestDate in descending order (newest first)
        documentArray.sort((a, b) => {
            const dateA = new Date(a.requestDate || 0);
            const dateB = new Date(b.requestDate || 0);
            return dateB - dateA;
        });
        
        res.send(documentArray);
    } catch (err) {
        console.log(err);
        res.status(500).send({ error: "Internal Server Error" });
    }
});

router.put('/:documentId', async (req, res) => {
    const { documentId } = req.params
    const updatedData = req.body
    
    try {
        // Get the existing document
        const docSnapshot = await db.ref(`document/${documentId}`).once('value')
        const existingDoc = docSnapshot.val()
        
        if (!existingDoc) {
            return res.status(404).send({ error: "Document not found" })
        }
        
        // Update only the fields provided in the request
        await db.ref(`document/${documentId}`).update(updatedData)
        
        res.send({ 
            success: "Document updated successfully",
            documentId
        })
    } catch (err) {
        console.log(err)
        res.status(500).send({ error: "Internal Server Error" })
    }
})


module.exports = router