// Copyright 2017 Google LLC.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import * as functions from 'firebase-functions'
import * as _ from 'lodash'
import { google } from 'googleapis'

const serviceAccount = require('../serviceAccount.json')
const jwtClient = new google.auth.JWT({
    email: serviceAccount.client_email,
    key: serviceAccount.private_key,
    scopes: [ 'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/documents',
    'https://www.googleapis.com/auth/presentations',
    'https://www.googleapis.com/auth/drive'
],  // read and write sheets
})
const jwtAuthPromise = jwtClient.authorize().then(function(auto){
    console.log(auto)
})
const sheets = google.sheets('v4');
const slides = google.slides({version:'v1',auth: jwtClient});
// const Gdocs = google.docs({version: 'v1',auth:  jwtClient});
const drive = google.drive({version:'v3',auth: jwtClient});

type Scores = { string: number }

export const copyScoresToSheet = functions.database.ref('/scores').onUpdate(async change => {
    const spreadsheetId = '1588aKnTpo2G9WXWVPOW5S0c319qkvC1GKj4wkbqz-Lw'
    const data: Scores = change.after!.val()

    // Sort the scores.  scores is an array of arrays each containing name and score.
    const scores = _.map<Scores, [string, number]>(data, (value, key) => [key, value])
    scores.sort((a,b) => { return b[1] - a[1] })

    await jwtAuthPromise
    await sheets.spreadsheets.values.update({
        auth: jwtClient,
        spreadsheetId: spreadsheetId,
        range: 'Scores!A2:B',  // update this range of cells
        valueInputOption: 'RAW',
        requestBody: { values: scores }
    }, {})
});

export const createNewSS = functions.https.onRequest(async (req, res) => {
    const request = {
        resource: {
        // TODO: Add desired properties to the request body.
            properties: {
                title: "Testing sheet " + Date.now()
            }
        },
        auth: jwtClient,
    };
    await jwtAuthPromise
    await sheets.spreadsheets.create(request).then(async function(ss){
        // res.send(ss.data);
        // console.log(ss.data.spreadsheetId,ss.data);
        // --- Drive Api --------------
            const fileId = ss.data.spreadsheetId;
            const permisos = {
                fileId: fileId,
                fields: "id",
                resource: {
                    role: "writer",
                    type: "user",
                    emailAddress: "inventarios@denzilescolar.edu.co"
                }
            }
            await drive.permissions.create(permisos).then(async function(ssharet){
                const respuesta = [ssharet.data, ss.data]
                console.log(respuesta);
                res.send(respuesta);
            }) 
        // ----------------------------
        return
    })
});

export const createLabels = functions.https.onRequest(async (req, res) => {
    const TemplateId = "1QtTNUQBuPHz-iVntcGA2IAP1fYwa-kqzWZYApI8WeEo";
    const LabelsFolderId = "1S18NFap--79w8yVG_XxCuyVPupBpyDq-";
    const copyParameters = {
        fileId: TemplateId,
        resource: {
            parents: [LabelsFolderId],
            name: 'Nueva etiqueta' + Date.now()
        }
    }
    await drive.files.copy(copyParameters).then(async function(slideCopy){
        const presentationId  = slideCopy.data.id
        const dataReplace = {
            presentationId: presentationId,
            resource: {
                requests: [
                    {
                        replaceAllText: {
                            containsText: {
                                text: '<estado>'
                            },
                            replaceText: 'bueno'
                        }
                    },
                    {
                        replaceAllText: {
                            containsText: {
                                text: '<fila>'
                            },
                            replaceText: '1'
                        }
                    },
                    {
                        replaceAllText: {
                            containsText: {
                                text: '<sede>'
                            },
                            replaceText: 'Mi sede'
                        }
                    },
                    {
                        replaceAllText: {
                            containsText: {
                                text: '<ubicacion>'
                            },
                            replaceText: 'Mi ubicacion'
                        }
                    },
                    {
                        replaceAllText: {
                            containsText: {
                                text: '<sub-ubicacion>'
                            },
                            replaceText: 'Mi sub-ubicacion'
                        }
                    },
                    {
                        replaceAllText: {
                            containsText: {
                                text: '<nombre>'
                            },
                            replaceText: 'Mi nombre'
                        }
                    }
                ]
            }
        };
        await slides.presentations.batchUpdate(dataReplace).then(async function(slideLabel){
            const respuesta = [slideCopy.data,slideLabel.data];
            console.log(respuesta)
            await drive.files.list({
                orderBy: "name",
                q: "name = 'Mega' and mimeType = 'application/vnd.google-apps.folder'"
              })
            .then(function(response) {
                // Handle the results here (response.result has the parsed body).
                console.log("Response", response);
                const respuesta2 = [slideCopy.data,slideLabel.data, response];
                res.send(respuesta2);
            },
            function(err) { 
                console.error("Error al buscar Folder", err);
                res.send(err);
            });
        });
    })
});