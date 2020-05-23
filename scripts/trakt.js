require('dotenv').config();
const fetch = require("node-fetch");

const {
    TRAKT_ID: traktId,
    TRAKT_USERNAME: traktUser,
} = process.env

const API_URL = 'https://api.trakt.tv';


module.exports.fetchData = async function main() {

    let endpoint = 'stats',
        API_END = `${API_URL}/users/${traktUser}/${endpoint}`;
    let mainData;

    try {
        mainData = await fetch(API_END, {
            headers: {
                'Content-Type': 'application/json',
                'trakt-api-key': traktId,
                'trakt-api-version': '2',
            }
        });
        mainJson = await mainData.json();
        return mainJson;

    } catch (error) {
        console.error(`movie-box ran into an issue getting your Trakt.tv data:\n${error}`);
    }
}