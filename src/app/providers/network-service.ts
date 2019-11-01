import { Injectable } from '@angular/core';
// import { AlertController, Events } from '@ionic-angular';
import { Network } from '@ionic-native/network/ngx';
import { AlertController, Events } from '@ionic/angular';
import { DataService } from './data-service';
import * as firebase from 'firebase/app';
// import 'firebase/auth';
import 'firebase/database';
import { ReplaySubject } from 'rxjs';
// import 'firebase/functions';

export enum ConnectionStatusEnum {
    Online,
    Offline
}


@Injectable()
export class NetworkProvider {

  previousStatus;
  rol;
  uid;
  public netObserver: ReplaySubject<any> = new ReplaySubject<any>();

  constructor(public alertCtrl: AlertController, 
              public network: Network,
              private ds: DataService,
              public eventCtrl: Events) {

    console.log('Hello NetworkProvider Provider');

    this.previousStatus = ConnectionStatusEnum.Online;    
  }

    public initializeNetworkEvents(rol,uid): void {
        let este = this;
        this.rol = rol;
        this.uid = uid;
        let connectedRef = firebase.database().ref(".info/connected");
        // We're connected (or reconnected)! Do anything here that should happen only if online (or on reconnect)
        let myConnectionsRef = firebase.database().ref(this.rol).child(this.uid).child('connections');
        // stores the timestamp of my last disconnect (the last time I was seen online)
        let lastOnlineRef = firebase.database().ref(this.rol).child(this.uid).child('lastOnline');

        this.network.onDisconnect().subscribe(() => {
            if (this.previousStatus === ConnectionStatusEnum.Online) {
                this.eventCtrl.publish('network:offline');
                this.netObserver.next(false)
            }
            this.previousStatus = ConnectionStatusEnum.Offline;
        });
        this.network.onConnect().subscribe(() => {
            connectedRef.on("value", function(snap) {
                if (snap.val() === true) {
                    // este.eventCtrl.publish("connected");
                    if (este.previousStatus === ConnectionStatusEnum.Offline) {
                        este.eventCtrl.publish('network:online');
                        este.netObserver.next(true)
                        // este.ds.syncDatabase();
                    }
                    este.previousStatus = ConnectionStatusEnum.Online;
                    // We're connected (or reconnected)! Do anything here that should happen only if online (or on reconnect)
                    let con = myConnectionsRef.push();

                    // When I disconnect, remove this device
                    con.onDisconnect().remove();

                    // Add this device to my connections list
                    // this value could contain info about the device or a timestamp too
                    con.set(true);

                    // When I disconnect, update the last time I was seen online
                    // Guarda el timestamp cuando la app se destruye
                    lastOnlineRef.onDisconnect().set(firebase.database.ServerValue.TIMESTAMP);
                } else {
                    // este.eventCtrl.publish("not connected");
                    if (este.previousStatus === ConnectionStatusEnum.Online) {
                        este.eventCtrl.publish('network:offline');
                        este.netObserver.next(false)
                    }
                    este.previousStatus = ConnectionStatusEnum.Offline;
                }
            });
        });
    }
    getStatus(){
        if (this.previousStatus === ConnectionStatusEnum.Online) {
            return true
        }else{
            return false
        }
    }
    setlastOnline(){
        console.log('Rol y UID de usuario:',this.rol,this.uid)
        let lastOnlineRef = firebase.database().ref(this.rol).child(this.uid).child('lastOnline');
        lastOnlineRef.onDisconnect().set(firebase.database.ServerValue.TIMESTAMP);
    }

}