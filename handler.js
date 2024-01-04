'use strict';

const { google } = require('googleapis');
const sheets = google.sheets('v4');

exports.endpoint = async (event) => {
    const apiKey = process.env.GOOGLE_API_KEY; // Ensure this is stored in your environment variables
    const sheetId = event.pathParameters.id; // Assuming the ID is part of the URL path

    google.options({ auth: apiKey });

    // Determine action based on HTTP method
    switch (event.httpMethod) {
        case 'GET':
            // Handling reading from the sheet
            return readSheet(sheetId);
        case 'POST':
            // Handling writing to the sheet
            const values = JSON.parse(event.body); // expecting { range: "", values: [[]]}
            return writeSheet(sheetId, values);
        default:
            return {
                statusCode: 405,
                body: JSON.stringify({ message: 'Method Not Allowed' }),
            };
    }
};

async function readSheet(sheetId) {
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: 'Sheet1', // specify your range here
        });

        return {
            statusCode: 200,
            body: JSON.stringify(response.data),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
}

async function writeSheet(sheetId, { range, values }) {
    try {
        const response = await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: range,
            valueInputOption: 'RAW',
            resource: {
                values: values,
            },
        });

        return {
            statusCode: 200,
            body: JSON.stringify(response.data),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
}
