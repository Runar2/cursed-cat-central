const express = require('express');
const app = express();

const port = 5000;
app.get('/test', (req, res) => {
    console.log('Test route hit');
    res.send('Hello from simple server');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});