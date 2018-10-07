const bodyParser = require('body-parser');
const jsonServer = require('json-server');
const request = require('request');

const helmet = require('helmet');

const auth = require('./server');

const server = jsonServer.create();
const router = jsonServer.router('./db.json');

const HOST = 'http://localhost:';
const PORT = 3000;

server.use(helmet());

server.use(jsonServer.defaults());
server.use(bodyParser.urlencoded({extended: true}));
server.use(bodyParser.json());


server.use( (req, res, next) => {

  if (req.headers.authorization === undefined || req.headers.authorization.split(' ')[0] !== 'Bearer') {
    const status = 401;
    const message = 'Error in authorization format';
    res.status(status).json({status, message});
    return;
  }
  try {
     auth.verifyToken(req.headers.authorization.split(' ')[1]);
     next();
  } catch (err) {
    const status = 401;
    const message = 'Error access_token is revoked';
    res.status(status).json({status, message});
  }
 
});

/** GET ALL TODOS FROM USER **/
server.get('/api/all/:user', function (req, res) {
  // TO-DO: INPUT VALIDATION 
  request(HOST+PORT+'/api/'+req.params.user, {
    'auth': {
      'bearer': req.headers.authorization.split(' ')[0]
    }}).pipe(res); 
  // TO-DO: HANDLE ERROR
});

/** ADD TODO TO USER **/
server.post('/api/add/:user', function (req, res) {
  // TO-DO: INPUT VALIDATION  
  request.post(HOST+PORT+'/api/'+req.params.user, {'auth': {
    'bearer': req.headers.authorization.split(' ')[0]
  },form:{todo:req.body.todo}}).pipe(res);
  // TO-DO: HANDLE ERROR
});

/** DELETE TODO FROM USER **/
server.delete('/api/delete/:user/:id', function (req, res) {
  // TO-DO: INPUT VALIDATION  
  request.delete(HOST+PORT+'/api/'+req.params.user+'/'+req.params.id,  {
    'auth': {
      'bearer': req.headers.authorization.split(' ')[0]
    }});
  // TO-DO: HANDLE ERROR
  res.set('Content-Type', 'text/plain');
  res.send(`You deleted: ${req.params} `);
 
});

/** UPDATE TODO FOR USER **/
server.put('/api/update/:user/:id', function (req, res) {
  // TO-DO: INPUT VALIDATION
  request.put(HOST+PORT+'/api/'+req.params.user+'/'+req.params.id, {'auth': {
    'bearer': req.headers.authorization.split(' ')[0]
  },form:{todo:req.body.todo}});
  // TO-DO: HANDLE ERROR 
  res.set('Content-Type', 'text/plain');
  res.send(`You updated: ${req.params} `);
  
});

/** QUERY TODOS TODO BY USER **/
server.get('/api/filter/:user/:query', function (req, res) {
  // TO-DO: INPUT VALIDATION 
  request(HOST+PORT+'/api/'+req.params.user + '?q=' +req.params.query , {
    'auth': {
      'bearer': req.headers.authorization.split(' ')[0]
    }}).pipe(res); 
  // TO-DO: HANDLE ERROR
});

server.use('/api', router); // to avoid any request which does not point to api

server.listen(3000, () => {
  console.log('Run TODO API Server');
  
});