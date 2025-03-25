const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).json({ status: 'UP', message: 'Server is running', timestamp: new Date() });
});

module.exports = router;