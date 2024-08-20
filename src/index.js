import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import FHIR from 'fhirclient';

// Function to generate a random string for the state parameter
function generateRandomString(length) {
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => ('0' + byte.toString(16)).slice(-2)).join('');
}


const rootElement = document.getElementById('root');

const clientId = process.env.REACT_APP_CLIENT_ID; // Your client ID
const redirectUri = process.env.REACT_APP_REDIRECT_URI; // Your redirect URI
const scope = 'profile openid email';
const authUrl = `https://fhir.epic.com/interconnect-fhir-oauth/oauth2/authorize`;
const tokenUrl = `https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token`;

const redirectToAuthorization = () => {
    const state = generateRandomString(16); // Generate a random state string
    const authorizationUrl = `${authUrl}?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}`;
    window.location.href = authorizationUrl; // Redirect to the authorization endpoint
};

const exchangeCodeForToken = async (code) => {
    const redirectUri = process.env.REACT_APP_REDIRECT_URI;
    const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: redirectUri,
            client_id: clientId,
            // If you have a client secret, include it here:
            // client_secret: YOUR_CLIENT_SECRET,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to exchange code for token: ${errorText}`);
    }

    return response.json(); // Return the access token response
};

const smartLaunch = async () => {
    // Check if there's an authorization code in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
        try {
            const tokenResponse = await exchangeCodeForToken(code);
            const accessToken = tokenResponse.access_token;
            const token_type = tokenResponse.token_type;
            const expires_in = tokenResponse.expires_in;
            const id_token = tokenResponse.id_token;
            console.log('\n accessToken', accessToken);
            console.log('\n token_type', token_type);
            console.log('\n expires_in', expires_in);
            console.log('\n id_token', id_token);
            // Initialize the FHIR client with the access token
            const client = FHIR.client({
                // FHIR server URL
                serverUrl: 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4',
                // 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/Patient/erXuFYUfucBZaryVksYEcMg3',
                token: accessToken, // Use the access token
                clientId: clientId,
                redirectUri: redirectUri
            });

            ReactDOM.render(<App client={client} />, rootElement);
        } catch (error) {
            console.error("Error exchanging code for token:", error);
        }
    } else {
        // No code, redirect to authorization
        redirectToAuthorization();
    }
};

smartLaunch();