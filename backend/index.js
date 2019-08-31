

const express         = require('express');
const fetch           = require('node-fetch');
const redirectToHTTPS = require('express-http-to-https').redirectToHTTPS;
const webpush         = require('web-push');
const cors            = require('cors');

//dummy in memory store
const dummyDB = { subscription: null };

//Object to store the public and private keys
var vapidKeys = null;

function generateKeys()
{
    try
    {
        vapidKeys = webpush.generateVAPIDKeys();

        console.log(vapidKeys);

        webpush.setVapidDetails
        {
            'mailto:yodaime_sensei@hotmail.com',
            vapidKeys.publicKey,
            vapidKeys.privateKey
        }
    }
    catch( err )
    {
        throw err ;
    }
}

/**
 * Gets the VAPID keys generate by web push
 *
 * @param {Request} req request object from Express.
 * @param {Response} resp response object from Express.
 */
function getKeys(req, resp) 
{
    var response = { value: vapidKeys.publicKey} ;
    //resp.json(response);
    resp.setHeader('Content-Type', 'application/json');
    resp.end(JSON.stringify(response));
}

/**
 * Starts the Express server.
 *
 * @return {ExpressServer} instance of the Express server.
 */
function startServer() 
{
    try
    {
        generateKeys();

        const app = express();

        app.use( cors( {credentials: true,} ) );
    
        // Redirect HTTP to HTTPS,
        app.use(redirectToHTTPS([/localhost:(\d{4})/], [], 301));
    
        // Logging for each request
        app.use((req, resp, next) => 
        {
            const now = new Date();
            const time = `${now.toLocaleDateString()} - ${now.toLocaleTimeString()}`;
            const path = `"${req.method} ${req.path}"`;
            const m = `${req.ip} - ${time} - ${path}`;
            // eslint-disable-next-line no-console
            console.log(m);
            next();
        });
    
        // Handle requests for the data
        app.get('/get-keys', getKeys);
    
        // Handle requests for static files
        app.use(express.static('public'));
    
        // Start the server
        return app.listen('4000', () => 
        {
            // eslint-disable-next-line no-console
            console.log('[Backend] Local DevServer Started on port 4000');
        });
    }
    catch( err )
    {
        console.log('[Backend] Impossible to launch backend');
        console.log(err.message);
    }
  }
  
  startServer();