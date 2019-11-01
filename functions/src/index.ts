import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin';
admin.initializeApp(functions.config().firebase);
const ref = admin.database().ref();
import * as _ from 'lodash'
import { google } from 'googleapis'
import * as fs from 'fs-extra'
import * as sharp from 'sharp';
import { tmpdir } from 'os';
import { join, dirname } from 'path';
// import * as Storage from '@google-cloud/storage'
const {Storage} = require('@google-cloud/storage');
const gcs = new Storage();

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
const Gdocs = google.docs({version: 'v1',auth:  jwtClient});
const drive = google.drive({version:'v3',auth: jwtClient});

type Inventario = { [key: string ]: any };
const inventario: Inventario = {};
inventario['folders'] = [];

type Scores = { string: number }
// ---- Pruebas --------------------------------------------------------------------
    export const copyScoresToSheet = functions.database.ref('/scores').onUpdate(async change => {
        const spreadsheetId = '1588aKnTpo2G9WXWVPOW5S0c319qkvC1GKj4wkbqz-Lw'
        const data: Scores = change.after!.val()

        // Sort the scores.  scores is an array of arrays each containing name and score.
        const scores = _.map<Scores, [string, number]>(data, (value, key) => [key, value])
        scores.sort((a,b) => { return b[1] - a[1] })

        console.log(scores)

        await jwtAuthPromise
        await sheets.spreadsheets.values.update({
            auth: jwtClient,
            spreadsheetId: spreadsheetId,
            range: 'Scores!A2:B',  // update this range of cells
            valueInputOption: 'RAW',
            requestBody: { values: scores }
        }, {})
    });

    /* export const createNewSS = functions.https.onRequest(async (req, res) => {
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
    }); */

    /* export const CopyUpdateQuery = functions.https.onRequest(async (req, res) => {
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
                    q: "name = 'Mega2' and mimeType = 'application/vnd.google-apps.folder'"
                })
                .then(function(response) {
                    // Handle the results here (response.result has the parsed body).
                    console.log("Response", response);
                    const respuesta2 = [slideCopy.data,slideLabel.data, response.data];
                    res.send(respuesta2);
                },
                function(err) { 
                    console.error("Error al buscar Folder", err);
                    res.send(err);
                });
            });
        })
    }); */
// ---- Imagenes -------------------------------------------------------------------
    export const uploadImagen = functions.https.onCall(async (data, context) => {
        const createParameters = {
            fields: 'id',
            resource: {
                name: data.nombre,
                parents: ['1A95EyNrhC_PauMCZlr0YNLy3lP4PLvJx'] // drive/Imagenes/thumbs
            },
            media: {
                mimeType: 'image/jpeg',
                body: data.path//fs.createReadStream(data.path)
            }
        }
        return await drive.files.create(createParameters)
        .then(async function(file) {
            console.log('Imagen Id: ', file);
            return file
        })
        .catch(function(err) {
            console.error('Error imagen',err);
            return err
        })
        /* const sizes = [64, 128, 256];
        const workingDir = join(tmpdir(), 'thumbs');
        // const tmpFilePath = join(workingDir, data.fileName);

        const uploadPromises = sizes.map(async size => {
            const thumbName = `thumb@${size}_${data.fileName}`;
            const thumbPath = join(workingDir, thumbName);

            // Resize source image
            await sharp(data.path)
                .resize(size, size)
                .toFile(thumbPath);

            // Upload to GCS
            const createParameters = {
                fields: 'id',
                resource: {
                    name: data.nombre,
                    parents: ['1A95EyNrhC_PauMCZlr0YNLy3lP4PLvJx'], // drive/Imagenes/thumbs
                    mimeType: 'image/jpeg'
                },
                media: {
                    mimeType: 'image/jpeg',
                    body: fs.createReadStream(thumbPath)
                }
            }
            return await drive.files.create(createParameters)
            .then(async function(file) {
                console.log('Imagen Id: ', file);
                return file
            })
            .catch(function(err) {
                console.error('Error imagen',err);
                return err
            })
        });

        // 4. Run the upload operations
        await Promise.all(uploadPromises);

        // 5. Cleanup remove the tmp/thumbs from the filesystem
        return fs.remove(workingDir); */
    });
    export const generateThumbs = functions.storage
    .object()
    .onFinalize(async function (object:any){
        const bucket = gcs.bucket(object.bucket);
        const filePath:any = object.name;
        const fileName = filePath.split('/').pop();
        const bucketDir = dirname(filePath);

        const workingDir = join(tmpdir(), 'thumbs');
        const tmpFilePath = join(workingDir, 'source.png');

        if (fileName.includes('thumb@') || !object.contentType.includes('image')) {
            console.log('exiting function');
            return false;
        }

        // 1. Ensure thumbnail dir exists
        await fs.ensureDir(workingDir);

        // 2. Download Source File
        await bucket.file(filePath).download({
            destination: tmpFilePath
        });

        // 3. Resize the images and define an array of upload promises
        const sizes = [64, 128, 256];

        const uploadPromises = sizes.map(async size => {
            const thumbName = `thumb@${size}_${fileName}`;
            const thumbPath = join(workingDir, thumbName);

            // Resize source image
            await sharp(tmpFilePath)
                .resize(size, size)
                .toFile(thumbPath);

            // Upload to GCS
            return bucket.upload(thumbPath, {
                destination: join(bucketDir, thumbName)
            });
        });

        // 4. Run the upload operations
        await Promise.all(uploadPromises);

        // 5. Cleanup remove the tmp/thumbs from the filesystem
        return fs.remove(workingDir);
    });
// ---- Baja de articulo -----------------------------------------------------------
    export const BajaDeArticulo = functions.https.onCall(async (data, context) => {
        const TemplateId = "1lPqOz0S-CUl67tWZHJn7JENiJ_fpcxFTgBZHSm-1lQQ";
        const copyParameters = {
            fileId: TemplateId,
            resource: {
                parents: ['1tr2FTpNPLoJzmNC0Y22msJIH5hUj1_Ig'],
                name: "Acta de baja de "+ data.nombre +" "+ Date.now()
            }
        }
        return await drive.files.copy(copyParameters).then(async function(docCopy){
            const documentId  = docCopy.data.id
            const dataReplace = {
                documentId: documentId,
                resource: {
                    requests: [
                        {
                            replaceAllText: {
                                containsText: {
                                    text: '<<fecha>>'
                                },
                                replaceText: data['fecha']
                            }
                        },
                        {
                            replaceAllText: {
                                containsText: {
                                    text: '<<elemento>>'
                                },
                                replaceText: data['nombre']
                            }
                        }
                    ]
                }
            };
            return await Gdocs.documents.batchUpdate(dataReplace).then(resp=>{
                const respuesta = {doc:docCopy.data, update:resp.data};
                console.log(respuesta);
                return respuesta
            }).catch((error) => {
                console.error("No se pudo actualizar");
                throw new functions.https.HttpsError('internal', error.message);
            })
        }).catch((error) => {
            console.error("No se copiar el documento");
            throw new functions.https.HttpsError('internal', error.message);
        });
    });
// ---- Exporta datos de Firebase a GSheet -----------------------------------------
    export const exportaFS = functions.https.onCall(async (data, context) => {
        const TemplateId = "1N7InNh_qtrB9rKQFR7lGFwXaaQg9INoBJH-r2hsr_zI";
        const copyParameters = {
            fileId: TemplateId,
            resource: {
                parents: ['1jqmXygKJEcJoTRxs02irWDQoivYu5h3u'],
                name: "Resumen de "+ data.titulo +" "+ Date.now()
            }
        }
        return await drive.files.copy(copyParameters).then(async function(sheetCopy){
            // await setTimeout(async function (){
                
            // }, 500, data)
            console.log(sheetCopy);
            const update = {
                auth: jwtClient,
                spreadsheetId: sheetCopy.data.id,
                resource: {
                  valueInputOption: 'RAW',
                  data: [
                    {
                      range: data.range[0],
                      values: data.values
                    },
                    {
                        range: data.range[1],
                        values: data.detallado
                    },
                  ]
                }
            }
            return await sheets.spreadsheets.values.batchUpdate(update).then(resp=>{
                const respuesta = {sheet:sheetCopy.data, update:resp.data};
                console.log(respuesta);
                return respuesta
            }).catch((error) => {
                console.error("No se pudo escribir en el rango: ",data.range," del documento de Id ",sheetCopy.data.id);
                throw new functions.https.HttpsError('internal', error.message);
            })
            // return sheetCopy.data
        }).catch((error) => {
            console.error("No se pudo copiar la spreadsheet");
            throw new functions.https.HttpsError('internal', error.message);
        });
        /* const request = {
            resource: {
                properties: {
                    title: "Resumen de "+ data.titulo +" "+ Date.now()
                }
            },
            auth: jwtClient,
        };
        await jwtAuthPromise
        return sheets.spreadsheets.create(request).then(async function(ss){
            data['spreadsheetId'] = ss.data.spreadsheetId
            // --- Drive Api --------------
            await setTimeout(async function (){
                console.log('entro a update:',data)
                const fileId = data.spreadsheetId;
                const permisos = {
                    fileId: fileId,
                    fields: "id",
                    resource: {
                        role: "writer",
                        type: "user",
                        emailAddress: "inventarios@denzilescolar.edu.co"
                    },
                    auth: jwtClient,
                }
                // await jwtAuthPromise
                await drive.permissions.create(permisos).then(async function(ssharet){
                    // ---- actualizo el nombre de la primera hoja ---
                    const actualiza = {
                      spreadsheetId: data.spreadsheetId,
                      resource: {
                        requests: [{
                            addSheet: {
                              properties: {
                                title: data.sheet[1]
                              }
                            }
                            },{
                            updateSheetProperties: {
                                properties: {
                                    title: data.sheet[0],
                                    sheetId: 0
                                },
                                    fields: "title"
                                }
                            }
                        ]
                      },
                      auth: jwtClient,
                    }
                    await sheets.spreadsheets.batchUpdate(actualiza).then(async function(newsheetName){
                        const update = {
                            auth: jwtClient,
                            spreadsheetId: data.spreadsheetId,
                            resource: {
                              valueInputOption: 'RAW',
                              data: [
                                {
                                  range: data.range[0],
                                  values: data.values
                                },
                                {
                                    range: data.range[1],
                                    values: data.detallado
                                },
                              ]
                            }
                        }
                        sheets.spreadsheets.values.batchUpdate(update).then(resp=>{
                            const respuesta = {create:ssharet.data, batchUpdate:newsheetName.data, update:resp.data};
                            console.log(respuesta);
                            return {create:ss.data}
                        }).catch((error) => {
                            console.error("No se pudo escribir en el rango: ",data.range," del documento de Id ",data.spreadsheetId);
                            throw new functions.https.HttpsError('internal', error.message);
                        });
                    }).catch((error) => {
                        console.error("No se pudo renombrar la hoja en el documento de Id ",data.spreadsheetId);
                        throw new functions.https.HttpsError('internal', error.message);
                    });
                }).catch((error) => {
                    console.error("No se pudo establecer permisos accseso en el documento de Id ",data.spreadsheetId);
                    throw new functions.https.HttpsError('internal', error.message);
                }); 
            }, 500, data)
            return ss.data
            // ----------------------------
        }).catch((error) => {
            console.error("No se crear el documento");
            throw new functions.https.HttpsError('internal', error.message);
        }); */
    });
    // export const exportaFD = functions.https.onCall(async (data, context) =>{
    //     /* const updateObject = {
    //         documentId: "1V3xtQbvxQA2llAHJE54r3lSgpjh_Bpf4k0pT6VQ94rg"
    //     }
    //     return await Gdocs.documents.get(updateObject).then(resp=>{
    //         const respuesta = {doc:resp.data};
    //         console.log(respuesta);
    //         return respuesta
    //     }).catch((error) => {
    //         console.error("No se pudo escribir en el documento: ",error.message);
    //         throw new functions.https.HttpsError('internal', error.message);
    //     }) */
    //     // const TemplateId = "1V3xtQbvxQA2llAHJE54r3lSgpjh_Bpf4k0pT6VQ94rg"; // 
    //     /* const copyParameters = {
    //         fileId: TemplateId,
    //         resource: {
    //             parents: ['17-hkb3TAis61HyIvxsZPf6MHSWBA7HoV'],
    //             name: "Acta de Resumen de "+ data.titulo +" "+ Date.now()
    //         }
    //     } */
    //     // return await drive.files.copy(copyParameters).then(async function(DocCopy){
    //         const celdas = data.tabla.table.celdas
    //         const requests : any = [];
    //         for(let i in celdas){
    //             requests.push(celdas[i])
    //         }
    //         const replace = {
    //             replaceAllText: {
    //                 containsText: {
    //                     text: '<<RESPONSABLE>>',
    //                     matchCase: true,
    //                 },
    //                 replaceText: 'Stanley illidge',
    //             }
    //         }
    //         requests.push(replace)
    //         /* const updateObject = {
    //             documentId: DocCopy.data.id,
    //             resource: {
    //                 requests: [
    //                     {
    //                         insertTable: {
    //                             "rows": data.tabla.table.rows,
    //                             "columns": data.tabla.table.columns,
    //                             "location": {
    //                                 "index": data.tabla.startIndex
    //                             }
    //                         }
    //                     }
    //                 ],
    //             },
    //         }; */
    //         const updateObject = {
    //             documentId: '1Jtiph_kVMDic4YbYxWx2PwPCDRUMvrK-IaKWgzDJDJI',
    //             resource: {
    //                 requests : [
    //                 {
    //                     'insertText': {
    //                       'location': {
    //                         'index': 916
    //                       },
    //                       'text': 'Hello Word - 1'
    //                   }
    //                 },
    //                 {
    //                     'insertText': {
    //                       'location': {
    //                         'index': 982
    //                       },
    //                       'text': 'Hello Word - 2'
    //                   }
    //                 },
    //                 {
    //                     'insertText': {
    //                       'location': {
    //                         'index': 1009
    //                       },
    //                       'text': 'Hello Word - 3'
    //                   }
    //                 },
    //                 {
    //                     'insertText': {
    //                       'location': {
    //                         'index': 1037
    //                       },
    //                       'text': 'Hello Word - 4'
    //                   }
    //                 },
    //                 {
    //                     'insertText': {
    //                       'location': {
    //                         'index': 1109
    //                       },
    //                       'text': 'Hello Word - 5'
    //                   }
    //                 },
    //                 {
    //                     'insertText': {
    //                       'location': {
    //                         'index': 1216
    //                       },
    //                       'text': 'Hello Word - 6'
    //                   }
    //                 }
    //               ]
    //             },
    //         };
    //         return await Gdocs.documents.batchUpdate(updateObject).then(async resp=>{
    //             const respuesta = {updateObject:updateObject,update:resp.data};
    //             console.log('Copia y tabla creadas',respuesta);
    //             return respuesta
    //             /* return await setTimeout(async function (){
    //                 const celdas = data.tabla.table.celdas
    //                 const requests : string[] = [];
    //                 for(let i in celdas){
    //                     requests.push(celdas[i])
    //                 }
    //                 const updateObject2 = {
    //                     documentId: DocCopy.data.id,
    //                     resource: {
    //                         requests: requests
    //                     },
    //                 };
    //                 return await Gdocs.documents.batchUpdate(updateObject2).then(resp2=>{
    //                     const respuesta2 = {doc:DocCopy.data, update:resp2.data};
    //                     console.log('Fin:',respuesta2);
    //                     return respuesta2
    //                 }).catch((error) => {
    //                     console.error("No se pudo crear la tabla en el documento: ",data.titulo," del documento de Id ",DocCopy.data.id);
    //                     throw new functions.https.HttpsError('internal', error.message);
    //                 })
    //             }, 1000, data) */
    //         }).catch((error) => {
    //             console.error("No se pudo escribir en el documento: ",data.titulo," del documento de Id ");
    //             throw new functions.https.HttpsError('internal', error.message,updateObject);
    //         })
    //     /* }).catch((error) => {
    //         console.error("No se pudo copiar el documento");
    //         throw new functions.https.HttpsError('internal', error.message);
    //     }); */
    // });
    /* async function CreateSheet(data:any){
        const request = {
            resource: {
                properties: {
                    title: "Resumen de "+ data.titulo +" "+ Date.now()
                }
            },
            auth: jwtClient,
        };
        await jwtAuthPromise
        await sheets.spreadsheets.create(request).then(async function(ss){
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
                    return Promise.resolve(respuesta);
                }) 
            // ----------------------------
            return
        })
    } */
    /* async function UpdateSheet(data:any){
        console.log('entro a update:',data)
        const fileId = data.spreadsheetId;
        const permisos = {
            fileId: fileId,
            fields: "id",
            resource: {
                role: "writer",
                type: "user",
                emailAddress: "inventarios@denzilescolar.edu.co"
            },
            auth: jwtClient,
        }
        await jwtAuthPromise
        await drive.permissions.create(permisos).then(async function(ssharet){
            // ---- actualizo el nombre de la primera hoja ---
            const actualiza = {
              spreadsheetId: data.spreadsheetId,
              resource: {
                requests: [{
                    updateSheetProperties: {
                        properties: {
                            title: data.sheet,
                            sheetId: 0
                        },
                            fields: "title"
                        }
                    }]
                },
                auth: jwtClient,
            }
            await sheets.spreadsheets.batchUpdate(actualiza).then(async function(newsheetName){
                sheets.spreadsheets.values.update({
                    auth: jwtClient,
                    spreadsheetId: data.spreadsheetId,
                    range: data.range,  // update this range of cells
                    valueInputOption: 'RAW',
                    requestBody: { values: data.values }
                }).then(resp=>{
                    const respuesta = {create:ssharet.data, batchUpdate:newsheetName.data, update:resp.data};
                    console.log(respuesta);
                    return respuesta
                }).catch((error) => {
                    console.error("No se pudo escribir en el rango: ",data.range," del documento de Id ",data.spreadsheetId);
                    throw new functions.https.HttpsError('internal', error.message);
                });
            }).catch((error) => {
                console.error("No se pudo renombrar la hoja en el documento de Id ",data.spreadsheetId);
                throw new functions.https.HttpsError('internal', error.message);
            });
        }).catch((error) => {
            console.error("No se pudo establecer permisos accseso en el documento de Id ",data.spreadsheetId);
            throw new functions.https.HttpsError('internal', error.message);
        }); 
    } */
// ---- Creo las etiquetas de cada articulo de la base de datos --------------------
    export const createLabels = functions.https.onCall(async (data, context) => {
        // const etiqueta = await createLabel(data)
        return createLabel(data)
    });
    export const deleteF = functions.https.onCall(async (data, context) => {
        // const resp = await deleteFile(data)
        return deleteFile(data)
    });
    async function createLabel(data:any){
        inventario['folders'] = [];
        const MainFolder = '1S18NFap--79w8yVG_XxCuyVPupBpyDq-';
        return await ref.child('folders').once('value')
        .then(async folders => {
            if (folders.exists()){
                inventario['folders'] = folders.val();
            }
            console.log('Objeto inventarios: ',inventario)
            if(typeof inventario['folders'][data.sede.nombre] === 'undefined'){
                await consultaFolder(data.sede.nombre,MainFolder,data.sede.nombre)
                console.log('sede:', inventario['folders'][data.sede.nombre])
            }
            const pathUbicacion = data.sede.nombre+' - '+data.ubicacion.nombre;
            if(typeof inventario['folders'][pathUbicacion] === 'undefined'){
                await consultaFolder(data.ubicacion.nombre,inventario['folders'][data.sede.nombre],pathUbicacion)
                console.log('ubicacion:',pathUbicacion,inventario['folders'][pathUbicacion] )
            }
            const pathSubUbicacion = data.sede.nombre+' - '+data.ubicacion.nombre+' - '+data.subUbicacion.nombre;
            if(typeof inventario['folders'][pathSubUbicacion] === 'undefined'){
                await consultaFolder(data.subUbicacion.nombre,inventario['folders'][pathUbicacion],pathSubUbicacion)
                console.log('subUbicacion:',pathSubUbicacion, inventario['folders'][pathSubUbicacion])
            }
            return await creaEtiqueta(data,inventario['folders'][pathSubUbicacion])
        }).catch(function (error) {
            console.log("Error foldersRef:", error);
            return error;
        });
    }
    async function creaFolder(nombre:string,parent:string,path:string){
        console.log('Crea Folder: ',nombre)
        const createParameters = {
            fields: 'id',
            resource: {
                name: nombre,
                parents: [parent],
                mimeType: 'application/vnd.google-apps.folder'
            }
        }
        return await drive.files.create(createParameters)
        .then(async function(FolderResponse) {
            await ref.child('folders').child(path).set(FolderResponse.data.id)
            .then(function(FolderSetResponse) {return})
            inventario['folders'][path] = FolderResponse.data.id
            console.log('Folder '+nombre+' Creado, su Id: ', FolderResponse.data.id, inventario['folders'][path]);
            return FolderResponse.data
        })
        .catch(function(creaFolderError) {
            console.error('Crea Folder Error: ',creaFolderError)
            return creaFolderError
        })
    }
    async function consultaFolder(nombre:string,parent:string,path:string){
        console.log('Consulta Folder: ',nombre)
        return await drive.files.list({
            orderBy: "name",
            q: "name = '"+nombre+"' and '"+parent+"' in parents and mimeType = 'application/vnd.google-apps.folder'"
        })
        .then(async function(consultaFolderResponse) {
            console.log("Response "+nombre+" Folder: ", consultaFolderResponse.data.files);
            if(typeof consultaFolderResponse.data.files !== 'undefined' && consultaFolderResponse.data.files.length > 0){
                await ref.child('folders').child(path).set(consultaFolderResponse.data.files[0].id)
                .then(function(FolderSetResponse) {return})
                inventario['folders'][path] = consultaFolderResponse.data.files[0].id;
                console.log("Existe "+nombre+" Folder Id: ", consultaFolderResponse.data.files[0].id,inventario['folders'][path]);
                return consultaFolderResponse.data
            }else{
                return await creaFolder(nombre,parent,path)
            }
        })
        .catch(function(consultaFolderError) {
            console.error('Consulta Folder Error: ',consultaFolderError)
            return consultaFolderError
        })
    }
    async function deleteFile(id:string){
        console.log('Archivo:',id)
        await drive.files.delete({
            fileId: id
        })
        .then(function(response) {
            // Handle the results here (response.result has the parsed body).
            console.log("Delete Response", response);
            return
        },function(err) { 
            console.error("Execute error", err); 
            return err
        });
    }
    async function creaEtiqueta(data:any,folder:string){
        const TemplateId = "1QtTNUQBuPHz-iVntcGA2IAP1fYwa-kqzWZYApI8WeEo";
        const copyParameters = {
            fileId: TemplateId,
            resource: {
                parents: [folder],
                name: data.nombre+' - '+data.sede.nombre+' - '+data.ubicacion.nombre+' - '+data.subUbicacion.nombre
            }
        }
        return await drive.files.copy(copyParameters).then(async function(slideCopy){
            const presentationId  = slideCopy.data.id
            const dataReplace = {
                presentationId: presentationId,
                resource: {
                    requests: [
                        {
                            createImage: {
                              url: data['qrUrl'],
                              elementProperties: {
                                pageObjectId: "SLIDES_API337207410_0"
                              }
                            }
                        },
                        {
                            replaceAllText: {
                                containsText: {
                                    text: '<estado>'
                                },
                                replaceText: data['estado']
                            }
                        },
                        {
                            replaceAllText: {
                                containsText: {
                                    text: '<fecha>'
                                },
                                replaceText: data['fecha']
                            }
                        },
                        {
                            replaceAllText: {
                                containsText: {
                                    text: '<sede>'
                                },
                                replaceText: data['sede'].nombre
                            }
                        },
                        {
                            replaceAllText: {
                                containsText: {
                                    text: '<ubicacion>'
                                },
                                replaceText: data['ubicacion'].nombre
                            }
                        },
                        {
                            replaceAllText: {
                                containsText: {
                                    text: '<sub-ubicacion>'
                                },
                                replaceText: data['subUbicacion'].nombre
                            }
                        },
                        {
                            replaceAllText: {
                                containsText: {
                                    text: '<nombre>'
                                },
                                replaceText: data['nombre']
                            }
                        }
                    ]
                }
            };
            return await slides.presentations.batchUpdate(dataReplace).then(async function(slideLabel){
                const respuesta = {etiqueta:slideCopy.data,update:slideLabel.data}
                console.log(respuesta)
                return respuesta
            }).catch(function (error) {
                console.log("Error update slide:", error);
                return error;
            });
        }).catch(function (error) {
            console.log("Error copy template:", error);
            return error;
        });
    }
// ---- Sedes ----------------------------------------------------------------------
    export const Editsedes = functions.https.onCall(async (data, context) => {
        ref.child('sedes/'+data.key+'/nombre').set(data.sede)
        .then(function(responseEdit) {
            console.log('Edit ',data.sede,' Ok');
            return responseEdit
        },function(err) { 
            console.error("Edit Execute error", err); 
            return err
        });
    });
    export const CreateSedes = functions.https.onCall(async (data, context) => {
        ref.child('sedes').push({
            nombre: data.sede,
            cantidad: 0
        })
        .then(function(responseCreate) {
            console.log('Create ',data.sede,' Ok');
            return responseCreate
        },function(err) { 
            console.error("Create Execute error", err); 
            return err
        });
    });
    export const RemoveSedes = functions.https.onCall(async (data, context) => {
        ref.child('sedes/'+data.key).remove()
        .then(function(responseRemove) {
            console.log('Remove ',data.sede,' Ok');
            return responseRemove
        },function(err) { 
            console.error("Remove Execute error", err); 
            return err
        });
    });
// ---- Ubicaciones ----------------------------------------------------------------
    export const Editubicaciones = functions.https.onCall(async (data, context) => {
        ref.child('ubicaciones2/'+data.ubicacionkey).update(data.ubicacion)
        .then(function(responseEdit) {
            console.log('Edit ',data.ubicacion,' Ok');
            return responseEdit
        },function(err) { 
            console.error("Edit Execute error", err); 
            return err
        });
    });
    export const Createubicaciones = functions.https.onCall(async (data, context) => {
        ref.child('ubicaciones2/').push({
            nombre: data.nombre,
            cantidad: 0,
            sede: data.sedekey,
            codigo: data.codigo,
            imagen: '/assets/shapes.svg'
        })
        .then(function(responseCreate) {
            console.log('Create ',data.sede,' Ok');
            return responseCreate
        },function(err) { 
            console.error("Create Execute error", err); 
            return err
        });
    });
    export const Removeubicaciones = functions.https.onCall(async (data, context) => {
        ref.child('ubicaciones/'+data.ubicacionkey).remove()
        .then(function(responseRemove) {
            console.log('Remove ',data.sede,' Ok');
            return responseRemove
        },function(err) { 
            console.error("Remove Execute error", err); 
            return err
        });
    });
// ---- subUbicaciones -------------------------------------------------------------
    export const EditSububicaciones = functions.https.onCall(async (data, context) => {
        ref.child('subUbicaciones2/'+data.key).update(data.subUbicacion)
        .then(function(responseEdit) {
            console.log('Edit ',data.ubicacion,' Ok');
            return responseEdit
        },function(err) { 
            console.error("Edit Execute error", err); 
            return err
        });
    });
    export const CreateSububicaciones = functions.https.onCall(async (data, context) => {
        ref.child('subUbicaciones2/').push({
            nombre: data.nombre,
            ubicacion: data.ubicacionkey,
            sede: data.sedekey,
            cantidad: 0,
            codigo: data.codigo,
            descripcion: '',
            imagen: '/assets/shapes.svg'
        })
        .then(function(responseCreate) {
            console.log('Create ',data.subUbicacion,' Ok');
            return responseCreate
        },function(err) { 
            console.error("Create Execute error", err); 
            return err
        });
    });
    export const RemoveSububicaciones = functions.https.onCall(async (data, context) => {
        // firebase.database().ref('subUbicaciones/'+this.ubicacion.key+'/'+articulo.key).remove()
        ref.child('subUbicaciones2/'+data.key).remove()
        .then(function(responseRemove) {
            console.log('Remove ',data.subUbicacion,' Ok');
            return responseRemove
        },function(err) { 
            console.error("Remove Execute error", err); 
            return err
        });
    });
// ---- Ingreso --------------------------------------------------------------------
    // export const xxx = functions.https.onCall(async (data, context) => {
    //     // firebase.database().ref('subUbicaciones/'+this.ubicacion.key+'/'+articulo.key+'/nombre').set(d.articulo)
    //     ref.child('subUbicaciones/'+data.ubicacionkey+'/'+data.key+'/nombre').set(data.articulo)
    //     .then(function(responseEdit) {
    //         console.log('Edit ',data.ubicacion,' Ok');
    //         return responseEdit
    //     },function(err) { 
    //         console.error("Edit Execute error", err); 
    //         return err
    //     });
    // });
// ---- Ingreso --------------------------------------------------------------------