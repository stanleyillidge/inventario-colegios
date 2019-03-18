import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin';
admin.initializeApp(functions.config().firebase);
const ref = admin.database().ref();
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

    export const CopyUpdateQuery = functions.https.onRequest(async (req, res) => {
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
    });
// ---- Contadores de articulos ----------------------------------------------------
    // export const contadorArticulos = functions.database.ref('/inventario/{pushId}').onCreate((data, context) => {
        
    // });
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
        await ref.child('folders').once('value')
        .then(async folders => {
            if (folders.exists()){
                inventario['folders'] = folders.val();
            }
            console.log('Objeto inventarios: ',inventario)
            if(typeof inventario['folders'][data.sede] === 'undefined'){
                await consultaFolder(data.sede,MainFolder,data.sede)
                console.log('sede:', inventario['folders'][data.sede])
            }
            let pathUbicacion = data.sede+' - '+data.ubicacion;
            if(typeof inventario['folders'][pathUbicacion] === 'undefined'){
                await consultaFolder(data.ubicacion,inventario['folders'][data.sede],pathUbicacion)
                console.log('ubicacion:',pathUbicacion,inventario['folders'][pathUbicacion] )
            }
            let pathSubUbicacion = data.sede+' - '+data.ubicacion+' - '+data.subUbicacion;
            if(typeof inventario['folders'][pathSubUbicacion] === 'undefined'){
                await consultaFolder(data.subUbicacion,inventario['folders'][pathUbicacion],pathSubUbicacion)
                console.log('subUbicacion:',pathSubUbicacion, inventario['folders'][pathSubUbicacion])
            }
            return creaEtiqueta(data,inventario['folders'][pathSubUbicacion])
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
        await drive.files.create(createParameters)
        .then(async function(FolderResponse) {
            await ref.child('folders').child(path).set(FolderResponse.data.id)
            .then(function(FolderSetResponse) {return})
            inventario['folders'][path] = FolderResponse.data.id
            console.log('Folder '+nombre+' Creado, su Id: ', FolderResponse.data.id, inventario['folders'][path]);
            return
        })
        .catch(function(creaFolderError) {
            console.error('Crea Folder Error: ',creaFolderError)
            return creaFolderError
        })
    }
    async function consultaFolder(nombre:string,parent:string,path:string){
        console.log('Consulta Folder: ',nombre)
        await drive.files.list({
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
                return
            }else{
                await creaFolder(nombre,parent,path)
                return
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
                name: data['titulo']
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
                                replaceText: data['estado']
                            }
                        },
                        {
                            replaceAllText: {
                                containsText: {
                                    text: '<fila>'
                                },
                                replaceText: data['fila']
                            }
                        },
                        {
                            replaceAllText: {
                                containsText: {
                                    text: '<sede>'
                                },
                                replaceText: data['sede']
                            }
                        },
                        {
                            replaceAllText: {
                                containsText: {
                                    text: '<ubicacion>'
                                },
                                replaceText: data['ubicacion']
                            }
                        },
                        {
                            replaceAllText: {
                                containsText: {
                                    text: '<sub-ubicacion>'
                                },
                                replaceText: data['subUbicacion']
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
            await slides.presentations.batchUpdate(dataReplace).then(async function(slideLabel){
                const respuesta = [slideCopy.data,slideLabel.data];
                console.log(respuesta)
                return respuesta
            });
        })
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
        ref.child('ubicaciones/'+data.sedekey+'/'+data.ubicacionkey+'/nombre').set(data.ubicacion)
        .then(function(responseEdit) {
            console.log('Edit ',data.ubicacion,' Ok');
            return responseEdit
        },function(err) { 
            console.error("Edit Execute error", err); 
            return err
        });
    });
    export const Createubicaciones = functions.https.onCall(async (data, context) => {
        // firebase.database().ref('ubicaciones/'+this.sede.key).push({
        //     nombre: d.ubicacion
        //   });
        ref.child('ubicaciones/'+data.sedekey).push({
            nombre: data.ubicacion,
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
    export const Removeubicaciones = functions.https.onCall(async (data, context) => {
        // firebase.database().ref('ubicaciones/'+este.sede.key+'/'+ubicacion.key).remove()
        ref.child('ubicaciones/'+data.sedekey+'/'+data.ubicacionkey).remove()
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
        // firebase.database().ref('subUbicaciones/'+this.ubicacion.key+'/'+articulo.key+'/nombre').set(d.articulo)
        ref.child('subUbicaciones/'+data.ubicacionkey+'/'+data.key+'/nombre').set(data.articulo)
        .then(function(responseEdit) {
            console.log('Edit ',data.ubicacion,' Ok');
            return responseEdit
        },function(err) { 
            console.error("Edit Execute error", err); 
            return err
        });
    });
    export const CreateSububicaciones = functions.https.onCall(async (data, context) => {
        // firebase.database().ref('subUbicaciones/'+this.ubicacion.key).push({
        //   nombre: d.subUbicacion
        // });
        ref.child('subUbicaciones/'+data.ubicacionkey).push({
            nombre: data.subUbicacion,
            cantidad: 0
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
        ref.child('subUbicaciones/'+data.ubicacionkey+'/'+data.key).remove()
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