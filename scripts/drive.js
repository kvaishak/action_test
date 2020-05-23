const fs = require('fs');
require('dotenv').config();
const readline = require('readline');
const { google } = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

const {
    CLIENT_ID: client_id,
    CLIENT_SECRET: client_secret,
    REDIRECT_URIS: redirect_uris,
    GDRIVE_FOLDER: folderId
} = process.env


// Load client secrets from a local file.
module.exports.upload = function uploadData(csv) {
    authorize(uploadCSV, csv);
    // authorize(listFiles);
}

// authorize(listFiles);
/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(callback, data) {

    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getAccessToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client, data);
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback) {
    // const code = process.env.VODE;
    // console.log(code);
    // oAuth2Client.getToken(code, (err, token) => {
    //     if (err) return console.error('Error retrieving access token', err);
    //     oAuth2Client.setCredentials(token);
    //     // Store the token to disk for later program executions
    //     fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
    //         if (err) return console.error(err);
    //         console.log('Token stored to', TOKEN_PATH);
    //     });
    //     callback(oAuth2Client);
    // });


    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}

/**
 * Lists the names and IDs of up to 10 files.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listFiles(auth) {
    const drive = google.drive({ version: 'v3', auth });
    drive.files.list({
        pageSize: 10,
        fields: 'nextPageToken, files(id, name)',
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        const files = res.data.files;
        if (files.length) {
            console.log('Files:');
            files.map((file) => {
                console.log(`${file.name} (${file.id})`);
            });
        } else {
            console.log('No files found.');
        }
    });
}

function uploadImage(auth) {
    const drive = google.drive({ version: 'v3', auth });

    var fileMetadata = {
        'name': 'youtube.jpg'
    };
    var media = {
        mimeType: 'image/jpg',
        body: fs.createReadStream('./scripts/aa.jpg')
    };
    drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id'
    }, function(err, file) {
        if (err) {
            // Handle error
            console.error(err);
        } else {
            console.log('File Id: ', file.id);
        }
    });
}

function uploadCSV(auth, data) {
    const drive = google.drive({ version: 'v3', auth });
    const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    var today = new Date();
    var monthName = month[today.getMonth()]
    var weekNumber = parseInt(today.getDate() / 7);

    var fileName = monthName + "_" + weekNumber;

    var fileMetadata = {
        'name': fileName,
        'mimeType': 'application/vnd.google-apps.spreadsheet',
        parents: [folderId]
    };
    var media = {
        mimeType: 'text/csv',
        body: data //fs.createReadStream('name.csv')
    };
    drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id'
    }, function(err, file) {
        if (err) {
            // Handle error
            console.error(err);
        } else {
            console.log("File upload of csv in google sheet format successfull");
            console.log('File Id:', file.id);
        }
    });
}