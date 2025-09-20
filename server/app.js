import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
const app = express();

dotenv.config();
app.use(express.json());

app.listen(3000, ()=> {
    console.log('Connected to server')
})