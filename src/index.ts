import express, { Request, Response } from 'express';

const app = express();
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.json({
        apiversion: "1",
        author: "Maua-Dev",
        color: "#8B0000",
        head: "tiger-king",
        tail: "hook",
        version: "1.0.0"
    });
});

app.post('/start', (req: Request, res: Response) => {
    res.send("ok");
});

app.post('/move', (req: Request, res: Response) => {
    console.log(req.body);
    const directions = ["up", "down", "left", "right"];
    const i = Math.floor(Math.random() * directions.length);
    const response = {
        move: directions[i],
        shout: `I'm moving ${directions[i]}!`
    };
    res.json(response);
});

app.post('/end', (req: Request, res: Response) => {
    res.send("ok");
});



