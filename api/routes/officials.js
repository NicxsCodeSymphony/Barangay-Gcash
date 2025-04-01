const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.database();

// POST to add an official
router.post('/', async (req, res) => {
    const data = req.body;

    try {
        const officialId = db.ref().child('officials').push().key; // Generate a new ID
        data.official_id = officialId; // Assign the generated ID

        await db.ref('officials/' + officialId).set(data);
        res.send({ success: "Official added successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).send({ error: "Internal Server Error" });
    }
});

// GET all officials with resident names
router.get('/', async (req, res) => {
    try {
        const snapshot = await db.ref('officials').once('value');
        const officials = snapshot.val();
        
        const officialsWithNames = await Promise.all(Object.keys(officials).map(async (key) => {
            const official = officials[key];
            const residentSnapshot = await db.ref('residents/' + official.resident_id).once('value');
            const resident = residentSnapshot.val();
            
            return {
                ...official,
                first_name: resident.first_name,
                middle_name: resident.middle_name,
                last_name: resident.last_name
            };
        }));

        res.send(officialsWithNames);
    } catch (err) {
        console.log(err);
        res.status(500).send({ error: "Internal Server Error" });
    }
});

// GET official by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const snapshot = await db.ref('officials/' + id).once('value');
        const official = snapshot.val();
        
        if (official) {
            const residentSnapshot = await db.ref('residents/' + official.resident_id).once('value');
            const resident = residentSnapshot.val();
            res.send({
                ...official,
                first_name: resident.first_name,
                middle_name: resident.middle_name,
                last_name: resident.last_name
            });
        } else {
            res.status(404).send({ error: "Official not found" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).send({ error: "Internal Server Error" });
    }
});

// PUT to update an official
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const data = req.body;

    try {
        await db.ref('officials/' + id).update(data);
        res.send({ success: "Official updated successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).send({ error: "Internal Server Error" });
    }
});

// DELETE an official
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await db.ref('officials/' + id).remove();
        res.send({ success: "Official deleted successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).send({ error: "Internal Server Error" });
    }
});

module.exports = router;