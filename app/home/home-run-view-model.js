
/*
    ######################################################################
    START MODULES SECTION
*/

// Load menu
const SelectedPageService = require("../shared/selected-page-service");

// viewModel (page) Object
const Observable = require("@nativescript/core").Observable;
const viewModel = new Observable();

// Load module NFC
const Nfc = require("../nativescript-nfc-wiro").Nfc;
const nfc = new Nfc();

// Load module vibrate
const Vibrate = require("nativescript-vibrate").Vibrate;
const vibrator = new Vibrate();

// Load module timer
const timerModule = require("@nativescript/core/timer");

// Load module observable array
const ObservableArray = require("@nativescript/core/data/observable-array").ObservableArray;

// Load module dialogs
const Dialogs = require("@nativescript/core").Dialogs;

// Load module fs
const fileSystemModule = require("@nativescript/core/file-system");

// Load platform module (for device infos)
const platformModule = require("@nativescript/core/platform");

// Load appSettings for save data in local memory
const appSettings = require("@nativescript/core/application-settings");

const { Frame } = require("@nativescript/core");

//const orientation = require( "nativescript-orientation" );
var insomnia = require("@nativescript-community/insomnia");


/*
    END MODULES SECTION
*/

/*
    ######################################################################
    START (STATE)(GLOBAL) VARIABLES 
*/

var starttime;
var endtime = 0;
var mytimer;
var timestate = 0;
var nfcstate = 0;
var nrpunto = 1;
var lasttime;
var listaPunti = new ObservableArray([]);
var listaPuntiDati = new Array();
var actualPath = 0;
var actualCat = 0;
var availablePaths;

/*
    END (STATE)(GLOBAL) VARIABLES
*/

/*
    ######################################################################
    START HELPER FUNCTIONS SECTION
*/

/**
 * Returns array containing some device infos
 */
function getDeviceInfos(){
    return new Array(platformModule.device.os, platformModule.device.model, platformModule.device.manufacturer, platformModule.device.uuid);
}

/**
 * Saves the data
 */
function saveData(){
    /**
     * Data Schema JSON
     * 
     * { userId, 
     *   runId,
     *   synchronized,
     *   runnerName,
     *   [listaPuntiDati],
     *   [deviceInfos]
     * }
     * 
     */
    var dataToSave = {}
    dataToSave.runnerId = "NULL";
    if(appSettings.getBoolean("isUserLoggedIn", false)) {
        dataToSave.runnerId = appSettings.getString("loggedUserId", "0");
        dataToSave.runnerName = appSettings.getString("loggedUserName","null");
    } else {
        dataToSave.runnerId = 0;
        dataToSave.runnerName = "-";
    }

    dataToSave.pathId = actualPath;
    dataToSave.catId = actualCat;
    dataToSave.synchronized = false;
    dataToSave.data = listaPuntiDati;
    dataToSave.devinfo = getDeviceInfos();
    const documentsFolder = fileSystemModule.knownFolders.documents();
    const folder = documentsFolder.getFolder("runnings");
    const fname = new Date().getTime() + ".json";
    const path = fileSystemModule.path.join(folder.path, fname);
    const file = fileSystemModule.File.fromPath(path);

    // Writing text to the file.
    file.writeText(JSON.stringify(dataToSave))
        .then((result) => {
            // Succeeded writing to the file.
            file.readText().then((res) => {
                // Succeeded read from file.
                //console.log(`File content:  ${res}`);
                listaPunti.push("CORSA SALVATA");//+fname);
            });
        }).catch((err) => {
            //console.log(err.stack);
        });
}

/**
 * Returns string with formatted time hh:mm:ss with difference of arg1 - arg2, both of type Date
 * If no arguments are passed, it returns the difference btw starttime and now
 */
function getTimeDiff(now = new Date(), localstarttime = starttime){
    let diffInMilliSeconds = (now - localstarttime);
    // calculate days
    // const days = Math.floor(diffInMilliSeconds / 86400000);
    // diffInMilliSeconds -= days * 86400000;
    // calculate hours
    const hours = Math.floor(diffInMilliSeconds / 3600000) % 24;
    diffInMilliSeconds -= hours * 3600000;    
    // calculate minutes
    const minutes = Math.floor(diffInMilliSeconds / 60000) % 60;
    diffInMilliSeconds -= minutes * 60000;    
    // calcolate seconds 
    const seconds = Math.floor(diffInMilliSeconds / 1000);
    diffInMilliSeconds -= seconds * 1000;    

    let difference = '';

    if(hours === 0) {
        difference += "00:";
    } else if (hours < 10) {
        difference += `0${hours}:`;
    } else {
        difference += `${hours}:`;
    }

    if(minutes === 0) {
        difference += "00:";
    } else if (minutes < 10) {
        difference += `0${minutes}:`;
    } else {
        difference += `${minutes}:`;
    }

    if(seconds === 0) {
        difference += "00";
    } else if (seconds < 10) {
        difference += `0${seconds}`;
    } else {
        difference += `${seconds}`;
    }

    return difference;
}

/**
 * If page object is passed as argument, scroll the "puntiLista" list to the bottom
 */
function scrollToBottom(thepage){
    setTimeout(() => {
    mScroller = thepage.getViewById("puntiLista");

    var offset = mScroller.scrollableHeight; // get the current scroll height
    mScroller.scrollToVerticalOffset(offset, false); // scroll to the bottom
    });

}

/**
 * It stops the timer
 * Must pass the time and a boolean indicating if is a manual stop or not and the local page for scrolling
 */
function stopTimer(now, isManual = true, localpage){
    timestate = 2;
    endtime = now;
    lasttime = endtime;
    timerModule.clearInterval(mytimer);
    viewModel.set("timerText", "RESET");
    viewModel.set("timerTextColor", "gray");
    viewModel.set("timbraPuntoiOSShow", "collapsed");
    listaPunti.push("FINISH");
    listaPunti.push("TOT TIME: "+getTimeDiff(endtime));
    var finstring = isManual ? "FINISH_M" : "FINISH";
    listaPuntiDati.push(new Array(finstring, endtime.toUTCString(), getTimeDiff(endtime)));
    viewModel.set("mainTimer", getTimeDiff(endtime));
    scrollToBottom(localpage);
    saveData();
    saveState();
}

/**
 * It stars the timer
 * Must pass the a boolean indicating if is a manual stop or not
 */
function startTimer(isManual = true){
    timestate = 1;
    nrpunto = 1;
    starttime = new Date();
    lasttime = starttime;
    mytimer = timerModule.setInterval( () => {
        viewModel.set("mainTimer", getTimeDiff());
    }, 100);
    viewModel.set("timerText", "STOP");
    viewModel.set("timerTextColor", "red");
    listaPunti.push("START");
    var ststring = isManual ? "START_M" : "START";
    listaPuntiDati.push(new Array(ststring, starttime.toUTCString(), "00:00:00"));
    viewModel.set("mCorsaShow","collapse");

    saveState();
}

/**
 * It punches a station
 * Must pass the local page for scrolling and the SCOMpayload
 */
function punch(localpage, m){
    let now = new Date();
    var nrpuntostring = nrpunto < 10 ? nrpunto+" " : nrpunto;
    var nrlanternastr = m < 100 ? m+" " : m;
    listaPunti.push(nrpuntostring + "  " + nrlanternastr + "  " + getTimeDiff(now)+"  "+getTimeDiff(now, lasttime));
    listaPuntiDati.push(new Array(m,now.toUTCString(),getTimeDiff(now)));
    scrollToBottom(localpage);
    nrpunto++;
    lasttime = now;
    saveState();
}

/**
 * Saves the state of current run
 */
function saveState(){
    appSettings.setNumber("state_timestate", timestate);
    appSettings.setNumber("state_nfcstate", nfcstate);
    appSettings.setNumber("state_nrpunto", nrpunto);
    appSettings.setString("state_starttime", starttime.toUTCString());
    appSettings.setString("state_lasttime", lasttime.toUTCString());
    appSettings.setString("state_listaPunti", listaPunti.toString());
    appSettings.setString("state_listaPuntiDati", JSON.stringify(listaPuntiDati));
}

/**
 * Restore the state of a current run
 * Useful if app is accidentaly closed (the run can be resumed) -> hence we assume the run already started
 */
function restoreRunningState(){
    timestate = appSettings.getNumber("state_timestate");;
    nrpunto = appSettings.getNumber("state_nrpunto");
    starttime = new Date(appSettings.getString("state_starttime"));
    lasttime = new Date(appSettings.getString("state_lasttime"));
    actualPath = appSettings.getNumber("idActualPath", 0);
    actualCat = appSettings.getNumber("idActualCat", 0);
    viewModel.set("mCorsaShow","collapse");
    if (global.isIOS) {
        viewModel.set("timbraPuntoiOSShow", "");
    } else {
        viewModel.set("timbraPuntoiOSShow", "collapsed");
    }

    if(timestate==1) {
        mytimer = timerModule.setInterval( () => {
            viewModel.set("mainTimer", getTimeDiff());
        }, 100);
        viewModel.set("timerText", "STOP");
        viewModel.set("timerTextColor", "red");
    } else {
        viewModel.set("mainTimer", getTimeDiff(lasttime, starttime));
        viewModel.set("timerText", "RESET");
        viewModel.set("timerTextColor", "gray");
    }

    listaPunti = new ObservableArray(appSettings.getString("state_listaPunti").split(','));
    viewModel.set("listaPunti", listaPunti);

    listaPuntiDati = JSON.parse( appSettings.getString("state_listaPuntiDati"));

    availablePaths = JSON.parse(appSettings.getString("availablePaths"));

    saveState();
}

/*
    END HELPER FUNCTIONS SECTION
*/

function HomeViewModel(localpage) {
    //console.log(localpage);
    // orientation.setOrientation("portrait");
    // orientation.disableRotation();

    let pathSelected = false;

    actualPath = appSettings.getNumber("idActualPath", 0);
    actualCat = appSettings.getNumber("idActualCat", 0);
    if(actualCat == 0 || actualPath == 0 || !appSettings.getBoolean("path_is_selected", false)) {
        Frame.topmost().navigate({
            moduleName: "home/home-page",
            clearHistory: true,
            transition: {
                name: "reveal"
            }
        });
    } else {
        pathSelected = true;
    }

    if( appSettings.getBoolean("keepAwake", false)) {
        insomnia.keepAwake();
    } else {
        insomnia.allowSleepAgain();
    }

    SelectedPageService.getInstance().updateSelectedPage("Home");
    if(!viewModel.get("mainTimer")){ // If the mainTimer is not set --> a run has not started
        if(appSettings.getNumber("state_timestate", 0) != 0){
            // If a run has not started in this session, but in another session there was a run running
            // for example if the app was closed during a run, then restore the state
            restoreRunningState();
        } else {
            viewModel.message = "";
            viewModel.mainTimer = "00:00:00";
            viewModel.timerText = "START";
            viewModel.timerTextColor = "green";
            viewModel.mCorsaText = "Cambia percorso";
            viewModel.mCorsaClass = "blue";
            viewModel.mCorsaShow = "";
            if (global.isIOS) {
                viewModel.timbraPuntoiOSShow = "visible";
            } else {
                viewModel.set("timbraPuntoiOSShow", "collapsed");
            }
            viewModel.set("listaPunti", listaPunti);
            actualPath = appSettings.getNumber("idActualPath", actualPath);
            actualCat = appSettings.getNumber("idActualCat", actualPath);
            availablePaths = JSON.parse(appSettings.getString("availablePaths"));
            if(pathSelected) {
                // console.log(actualPath+" "+actualCat);
                // console.log(availablePaths);
                viewModel.selectedPathName = availablePaths[actualPath].name + " | "+availablePaths[actualPath].cats[actualCat].name;
            }
        }
    }

    if(timestate==0){
        viewModel.mCorsaShow = "";
        if (global.isIOS) {
            viewModel.timbraPuntoiOSShow = "visible";
        } else {
            viewModel.set("timbraPuntoiOSShow", "collapsed");
        }
        availablePaths = JSON.parse(appSettings.getString("availablePaths"));
    }
    // console.log(actualPath+" "+actualCat);
    // console.log(availablePaths);

    if(pathSelected){
        viewModel.selectedPathName = availablePaths[actualPath].name + " | "+availablePaths[actualPath].cats[actualCat].name;
    }

    viewModel.mCorsa = () => {
        appSettings.setBoolean("path_is_selected", false);
        Frame.topmost().navigate({
            moduleName: "home/home-page",
            clearHistory: true,
            transition: {
                name: "reveal"
            }
        });
    };

    viewModel.timbraPuntoiOS = () => {
        setListener();
    };

    // Describe action on tapping START/FINISH/RESET button
    viewModel.switchTime = () => {
        var now = new Date();
        
        if (timestate == 1) {
            Dialogs.confirm({
                title: "Fermare la corsa",
                message: "Vuoi fermare la corsa? Non è più possibile timbrare punti dopo aver fermato la corsa. La corsa si ferma automaticamente al punto 'FINISH'",
                okButtonText: "Si, FERMA la corsa",
                cancelButtonText: "No, CONTINUA la corsa",
                neutralButtonText: "ANNULLA"
            }).then(function (result) {
                if(result){
                    stopTimer(now, true, localpage);
                }
            });
        } else if (timestate == 2) {
            Dialogs.alert({
                title: "Informazione",
                message: "La corsa è stata salvata e puoi rivederla tra le tue corse!",
                okButtonText: "OK"
            }).then(function () {
                // RESET
                // viewModel.set("mainTimer", "00:00:00");
                // viewModel.set("timerText", "START");
                // viewModel.set("timerTextColor", "green");
                endtime = 0;
                timestate = 0;
                listaPunti = new ObservableArray([]);
                viewModel.set("listaPunti", listaPunti);
                listaPuntiDati = new Array();
                viewModel.set("timerText","START");
                viewModel.set("timerTextColor", "green");
                viewModel.set("mainTimer", "00:00:00");
                viewModel.set("selectedPathName","Seleziona la corsa");
                if (global.isIOS) {
                    viewModel.set("timbraPuntoiOSShow", "visible");
                } else {
                    viewModel.set("timbraPuntoiOSShow", "collapsed");
                }
                appSettings.setBoolean("path_is_selected", false);
                saveState();
                Frame.topmost().navigate({
                    moduleName: "home/home-page",
                    clearHistory: true,
                    transition: {
                        name: "reveal"
                    }
                });
            });
        } else if (nfcstate == 1) {
            Dialogs.confirm({
                title: "Avviare la corsa",
                message: "Vuoi avviare la corsa manualmente? La corsa parte automaticmente al punto START.",
                okButtonText: "Si, AVVIA la corsa",
                cancelButtonText: "No, NON avviare la corsa",
                neutralButtonText: "ANNULLA"
            }).then(function (result) {
                if(result){
                    startTimer();
                }
            });
        }
    }

    nfc.enabled().then(function (on) {
        //console.log(on ? "Yes" : "No");
        if(on){
            nfcstate = 1;
            if(timestate==0)
                viewModel.set("timerTextColor", "green");
        } else {
            nfcstate = 0;
            if(timestate==0)
                viewModel.set("timerTextColor", "red");
        }
    });
      
    // Actions on NFC TAG detection
    function setListener() { 
        nfc.setOnNdefDiscoveredListener(function (data) {
            //console.log("CALLBACK CALLED");
            if (data.message) {
                let record = data.message[0];
                //console.log("Ndef discovered! Message record: " + record.payloadAsString);

                let m = record.payloadAsString;
                // NOT SCOM-Payload will ignored (SCOM-Payload = payload starting with keyword 'scom')
                if(m.substring(0,4) == 'scom') {

                    // Payload messagge starting at char 4th
                    m = m.substring(4);

                    
                    if(timestate == 1 && (m == 'FINISH' || m =='START')){
                        stopTimer(new Date(), false, localpage);
                        vibrator.vibrate(1000);
                        viewModel.set("message", "PUNTO TIMBRATO");
                    }

                    // Auto-start with every tag type
                    if(timestate == 0 && appSettings.getBoolean("path_is_selected", false)){
                        startTimer(false);
                        vibrator.vibrate(1000);
                        viewModel.set("message", "PUNTO TIMBRATO");
                    }

                    if(timestate == 1 && m != 'START' && m != 'FINISH') {
                        punch(localpage, m);
                        vibrator.vibrate(1000);
                        viewModel.set("message", "PUNTO TIMBRATO");
                    }

                    // Remove notification message
                    setTimeout(() => {
                        viewModel.set("message", "");
                    }, 2000);
                }
            }
        }, {
            // iOS-specific options
            stopAfterFirstRead: true,
            scanHint: "Avvicina il telefono al punto!"
        }).then(function () {
            //console.log("OnNdefDiscovered listener added");
        })
    }

    setListener();

    return viewModel;
}

module.exports = HomeViewModel;