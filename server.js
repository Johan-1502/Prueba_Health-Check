const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: ".env" });
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

var page = require('http').Server(app);
var io = require('socket.io')(page);

let ipServer = process.env.IP;
let portServer = process.env.PORT;
let ipLeader = process.env.IP_LEADER;
let portLeader = process.env.PORT_LEADER;

async function leaderHealthCheck() {
    console.log(`ipLeader: ${ipLeader}`, `portLeader: ${portLeader}`);
    setInterval(async () => {
        if (ipLeader && portLeader) {
            try {
                let response = await fetch(`http://${ipLeader}:${portLeader}/healthCheck`);
                let data = await response.json();

                if (data.answer === 'OK') {
                    logger('HTTP', 'healthCheck', 'Lider en linea')
                }
            } catch (error) {
                isLeaderOnline = false
                logger('HTTP', 'healthCheck', 'El lider ya no está en linea')
                throwElection();
            }
        }
    }, 1000);
};

app.get('/healthCheck', async (req, res) => {
    res.send({ answer: 'OK'});
});

leaderHealthCheck();

function logger(protocol, endpoint, message) {
    let log = `${new Date(Date.now()).toLocaleTimeString()} | ${protocol} | ${endpoint} | ${message}`;
    console.log(log);
};

page.listen(portServer, function () {
    logger('HTTP', 'Listen         ', `Servidor escuchando en http://${ipServer}:${portServer}`);
});