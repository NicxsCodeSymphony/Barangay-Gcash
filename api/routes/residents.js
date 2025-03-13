const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.database();

router.get('/', async (req, res) => {
    try {
        const snapshot = await db.ref('residents').once('value');
        const residents = snapshot.val();
        res.send(residents);
    } catch (err) {
        console.log(err);
        res.status(500).send({ error: "Internal Server Error" });
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const snapshot = await db.ref('residents/' + id).once('value');
        const resident = snapshot.val();
        
        if (resident) {
            res.send(resident);
        } else {
            res.status(404).send({ error: "Resident not found" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).send({ error: "Internal Server Error" });
    }
});

router.post('/', async (req, res) => {
    const data = req.body;

    try {
        const residentId = db.ref().child('emergency').push().key;
        data.residentId = residentId;

        await db.ref('residents/' + data.residentId).set(data);
        res.send({ success: "Resident added successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).send({ error: "Internal Server Error" });
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const data = req.body;

    try {
        await db.ref('residents/' + id).update(data);
        res.send({ success: "Resident updated successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).send({ error: "Internal Server Error" });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await db.ref('residents/' + id).remove();
        res.send({ success: "Resident deleted successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).send({ error: "Internal Server Error" });
    }
});

module.exports = router;