const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.database();

router.post('/', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const residentsRef = db.ref("residents");
        const snapshot = await residentsRef.once("value");

        if (!snapshot.exists()) {
            return res.status(404).json({ error: "No residents found" });
        }

        let user = null;
        snapshot.forEach(childSnapshot => {
            const resident = childSnapshot.val();
            if (resident.email === email && resident.password === password) {
                user = resident;
            }
        });

        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        if (user.status !== "Accepted") {
            return res.status(403).json({ error: "Account not accepted yet" });
        }

        res.status(200).json({
            message: "Login successful",
            user: {user}
        });

    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
