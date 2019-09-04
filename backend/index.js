

const express         = require('express');
const fetch           = require('node-fetch');
const redirectToHTTPS = require('express-http-to-https').redirectToHTTPS;
//Envoie des notifications
const webpush         = require('web-push');
//REquete Cross domain
const cors            = require('cors');
//Lecture body des requete post
const bodyParser      = require('body-parser');

//dummy in memory store
const dummyDB = { subscription: null };

//Object to store the public and private keys
var vapidKeys = null;

var notificationSend = false;

/****** Fonctions ********************************/

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
        throw new Error(err.toString());
    }
}

function saveToDatabase(subscription) {
    dummyDB.subscription = subscription ;
}

/************************************************/

/****** Web Push ********************************/

//const sendNotif = (subscription, dataToSend) => {
function sendNotif(subscription, dataToSend)
{
    const options = 
    {
        vapidDetails: 
        {
          subject: 'mailto:yodaime_sensei@hotmail.com',
          publicKey: vapidKeys.publicKey,
          privateKey: vapidKeys.privateKey
        }
        /*headers: {
          'Authorization': 'Basic YWxhZGRpbjpvcGVuc2VzYW1l'
        }*/
    }
    webpush.sendNotification(subscription, dataToSend, options)
    .then
    (
        function (data) 
        {
            return 'OK';
        },
        function (err) 
        {
            return err;
        }
    )
    .catch
    (
        function (ex) 
        {
            return new Error(ex) ;
        }
    );
}

/************************************************/


/****** Requête Réseau **************************/

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

function saveSubscription(req, resp)
{
    const subscription = req.body ;
    saveToDatabase(subscription);
    resp.json({message: 'succes'});
}

function sendNotification(req, resp)
{
    const subscription = dummyDB.subscription;
    if( subscription == null )
    {
        console.log('[Backend] No subscription');
        resp.json({message: 'No subscription'});
    }
    else
    {
        if( notificationSend == false )
        {
            const message = 'Notification test';
            notificationSend == true ;
            try
            {
                var temp = sendNotif(subscription, message);
                resp.json(temp);
            }            
            catch( err )
            {
                console.log(err);
            }
        }
    }
}

function checkNotif(req, resp)
{
    var response = { value: vapidKeys.publicKey} ;
    //resp.json(response);
    resp.setHeader('Content-Type', 'application/json');
    resp.end(JSON.stringify(response));
}

/*********************************************** */

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
        app.use(bodyParser.json());
    
        // Redirect HTTP to HTTPS,
        app.use(redirectToHTTPS([/localhost:(\d{4})/], [], 301));
        
        app.use(function(req, res, next) {
            res.setHeader("Content-Security-Policy", "img-src http://localhost:4000");
            return next();
        });
    
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
        app.get('/send-notification', sendNotification);
        app.get('/check-notification', checkNotif);

        app.post('/save-subscription', saveSubscription);
    
        // Handle requests for static files
        app.use(express.static('public'));

        //Content-Security-Policy: img-src http://localhost:4000/;
    
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