const fs = require('fs');
const bodyParser = require('body-parser');
const jsonServer = require('json-server');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');

const server = jsonServer.create();
const router = jsonServer.router('./database.json');
const userdb = JSON.parse(fs.readFileSync('./users.json', 'UTF-8'));

server.use(helmet());

server.use(jsonServer.defaults());
server.use(bodyParser.urlencoded({extended: true}));
server.use(bodyParser.json());


const SECRET_KEY = '123456789';

const expiresIn = '1h';

// Create a token from a payload 
function createToken(payload){
  return jwt.sign(payload, SECRET_KEY, {expiresIn});
}

// Verify the token 
function verifyToken (token){  
    return jwt.verify(token, SECRET_KEY, (err, decode) => decode !== undefined ?  decode : err);
}

// Check if the user exists in database
function isAuthenticated({email, password}){
  return (userdb.users.findIndex(user => user.email === email && user.password === password) !== -1);
}


server.post('/auth/login', (req, res) => {
  const {email, password} = req.body;
  if (isAuthenticated({email, password}) === false) {
    const status = 401;
    const message = 'Incorrect email or password';
    res.status(status).json({status, message});
    return;
  }
  const access_token = createToken({email, password});
  res.status(200).json({access_token});
});


server.use(router);

server.listen(3001, () => {
  console.log('Run Auth API Server');
});

module.exports.verifyToken = verifyToken;