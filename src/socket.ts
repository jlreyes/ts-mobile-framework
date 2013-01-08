/*
 * Socket class
 */
/// <reference path="./modules/globals.ts"/>
declare var io;
class Socket {
    private mUser : any;
    private mRoomId : number;
    private mErrorCallback: (e : string) => void;
    /* Internal socket.io socket */
    private mSocket;
    /* Disconnect callbacks */
    private mDisconnectCallback : () => void;
    private mDisconnected : bool;
    /*  New User callbacks */
    private mNewUserCallback : (username : string) => void;
    private mNewUserQueue : string[];
    /* User disconnection callbacks */
    private mUserDisconnectCallback : (username : string) => void;
    private mDisconnectedUserQueue : string[];
    /* Message callbacks */
    private mMessageCallbacks : {
        [type : string] : {
           [key : string] : (username: string, data : any) => void;
        };
    };
    private mUnhandledMessages : {
        [key : string] : any[];
    };

    constructor(user : any,
                roomId : number,
                errorCallback: (error : string) => void) {
        this.mUser = user;
        this.mRoomId = roomId;
        /* Create socket.io connection */
        var uri = "http://" + location.hostname + ":8080";
        var opts = {"force new connection":true, reconnect: false};
        this.mSocket = io.connect(uri, opts);
        /* Function to call on error */
        this.mErrorCallback = errorCallback;
        /* Register function callbacks */
        this.mSocket.on("message", this.onMessage.bind(this));
        this.mSocket.on("newUser", this.onNewUser.bind(this));
        this.mSocket.on("userDisconnect", this.onUserDisconnect.bind(this));
        this.mSocket.on("error", this.destroy.bind(this));
        this.mSocket.on("disconnect", this.onDisconnect.bind(this));
    }

    /* Called when the client wants to register this socket with the
     * server. Callback is called when we have finished registration.
     * Calling this effectively restarts this socket. That is, all
     * queues are flushed (because we should not be receiving any
     * data before registration) and all callbacks are removed */
    public register(callback: (response : any) => void) {
        /* Delete callbacks */
        delete this.mDisconnectCallback;
        delete this.mNewUserCallback;
        delete this.mUserDisconnectCallback;
        this.mMessageCallbacks = {};
        /* Reset queues */
        this.mDisconnected = false;
        this.mNewUserQueue = [];
        this.mDisconnectedUserQueue = [];
        this.mUnhandledMessages = {};
        /* Register this socket */
        this.mSocket.once("register", callback);
        this.mSocket.emit("register", {
            clientId: this.mUser.id,
            roomId: this.mRoomId
        });
    }

    /* Send a message */
    public sendMessage(type, message) {
        var data = {};
        data[type] = message
        this.mSocket.emit("message", data);
    }

    /* Destroy this socket */
    public destroy(e? : string) {
        this.mSocket.disconnect();
        if (Util.exists(e))
            this.mErrorCallback(e);
    }

    /**************************************************************************/
    /* DISCONNECT CALLBACKS                                                        */
    /**************************************************************************/
    private onDisconnect() {
        /* Call the callbacks */
        if (Util.exists(this.mDisconnectCallback))
            this.mDisconnectCallback();
        else this.mDisconnected = true;
    }

    public setDisconnectCallback(callback : () => void) {
        if (this.mDisconnected === true) callback();
        else this.mDisconnectCallback = callback;
    }

    public removeDisconnectCallback() {
        delete this.mDisconnectCallback;
    }

    /**************************************************************************/
    /* NEW USER CALLBACKS                                                     */
    /**************************************************************************/
    private onNewUser(username : string) {
        /* Make sure a callback exists */
        if (!Util.exists(this.mNewUserCallback)) {
            this.mNewUserQueue.push(username);
            return
        }
        /* Call the callback */
        this.mNewUserCallback(username);
    }

    public setNewUserCallback(callback : (username : string) => void) {
        this.mNewUserCallback = callback;
        /* clear the queue */
        while (this.mNewUserQueue.length > 0)
            callback(this.mNewUserQueue.shift());
    }

    public removeNewUserCallback() {
        delete this.mNewUserCallback;
    }

    /**************************************************************************/
    /* USER DISCONNECT CALLBACKS                                              */
    /**************************************************************************/
    private onUserDisconnect(username : string) {
        if (!Util.exists(this.mUserDisconnectCallback)) {
            this.mDisconnectedUserQueue.push(username);
            return;
        }
        /* Call the callback */
        this.mUserDisconnectCallback(username);
    }

    public setUserDisconnectCallback(callback : (username : string) => void) {
        this.mUserDisconnectCallback = callback;
        while (this.mDisconnectedUserQueue.length > 0)
            callback(this.mDisconnectedUserQueue.shift());
    }

    public removeUserDisconnectCallback() {
        delete this.mUserDisconnectCallback;
    }

    /**************************************************************************/
    /* MESSAGE CALLBACKS                                                      */
    /**************************************************************************/
    private onMessage(data) {
        var username = data.username;
        for (var key in data.message) {
            var handled = false;
            if (key in this.mMessageCallbacks) {
                for (var callbackKey in this.mMessageCallbacks[key]) {
                    handled = true;
                    var message = data.message[key];
                    this.mMessageCallbacks[key][callbackKey](username, message);
                }
            }
            /* If unhandled, we add it to out unhandled messages object */
            if (handled === false) {
                if (!Util.exists(this.mUnhandledMessages[key]))
                    this.mUnhandledMessages[key] = [];
                this.mUnhandledMessages[key].push(data);
            }   
        }
    }

    private handleQueuedMessages(type : string, callback: any) {
        var messages = this.mUnhandledMessages[type];
        if (!Util.exists(messages)) return;
        for (var i = 0; i < messages.length; i++) {
            var username = messages[i].username;
            var message = messages[i].message[type];
            callback(username, message);
        }
    }

    public addMessageCallback(type : string,
                              key : string,
                              callback : (username : string, data : any)
                                                                    => void) {
        if (!Util.exists(this.mMessageCallbacks[type]))
            this.mMessageCallbacks[type] = {};
        this.mMessageCallbacks[type][key] = callback;
        this.handleQueuedMessages(type, callback);
    }

    public removeMessageCallback(type: string, key : string) {
        delete this.mMessageCallbacks[type][key];
    }

    /*
     * GETTERS AND SETTERS
     */
    public getUser() : any {
        return this.mUser;
    }
}