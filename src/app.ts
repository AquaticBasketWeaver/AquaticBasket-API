import express from 'express';
import photos from './routes/photos';

const app = express();
const port = 8080; // default port to listen

app.use('/photos', photos);

// default page will just act as a "ping"
app.get('/', (req, res) => {
    res.sendStatus(200);
});

// start the Express server
app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
});
