// Load menu
const SelectedPageService = require("../shared/selected-page-service");

// viewModel (page) Object
const Observable = require("@nativescript/core").Observable;
const viewModel = new Observable();

// Frame
const { Frame } = require("@nativescript/core");

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

// HTTP module to update paths
const httpModule = require("@nativescript/core/http");

const checkSession = require("../shared/check-session");

var Application = require("@nativescript/core/application");
var TypeUtils = require("@nativescript/core/utils/types");

function getAppContext() {
  var ctx = Application.android.context;

  if (TypeUtils.isNullOrUndefined(ctx)) {
    ctx = java.lang.Class.forName("android.app.AppGlobals")
      .getMethod("getInitialApplication", null)
      .invoke(null, null);
  }

  if (TypeUtils.isNullOrUndefined(ctx)) {
    ctx = java.lang.Class.forName("android.app.ActivityThread")
      .getMethod("currentApplication", null)
      .invoke(null, null);
  }

  if (!TypeUtils.isNullOrUndefined(ctx)) {
    ctx = ctx.getApplicationContext();
  } else {
    ctx = undefined;
  }

  return ctx;
}
function openNFCSettings() {
    var ctx = getAppContext();
    if (TypeUtils.isNullOrUndefined(ctx)) {
        return false;
    }
    var intent = new android.content.Intent(
        android.provider.Settings.ACTION_WIRELESS_SETTINGS,
    );
    intent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
    ctx.startActivity(intent);
    return true;
}
/*
    END MODULES SECTION
*/

/*
    ######################################################################
    START (STATE)(GLOBAL) VARIABLES 
*/

var actualPath = 0;
var actualCat = 0;
var paths;
var pathsObject;
nfcstate = 0;

/*
    END (STATE)(GLOBAL) VARIABLES
*/

/*
    ######################################################################
    START HELPER FUNCTIONS SECTION
*/

/**
 * Initialize and updates available paths
 */
function updatePaths() {
    httpModule.getJSON("https://wiro.scom-mendrisio.ch/API/getPaths.php").then((r) => {

        //console.log(r);
        pathsFromServer = r.payload

        if(r.md5 != appSettings.getString("pathsUpdateHash","null")){
            appSettings.setString("availablePaths", JSON.stringify(pathsFromServer));
            appSettings.setString("pathsUpdateHash", r.md5);
            pathsFromServer = pathsFromServer//.filter( path => path.enabled == 1);     
            //console.log(pathsFromServer);         
     
        } else {
            pathsFromServer = (JSON.parse(appSettings.getString("availablePaths","null"))); 
            //console.log(pathsFromServer);         
        }
        //console.log(pathsFromServer);

        paths = Object.values(pathsFromServer).filter( path => path.enabled == 1);
        pathsObject = pathsFromServer;
        viewModel.set("listOfPaths", paths);
        viewModel.set("listOfCats", Object.values(paths[0].cats));
        viewModel.set("selectedItem", 0);
        viewModel.set("selectedItem2", 0);
        actualPath = paths[0].id;
        actualCat = Object.values(pathsObject[actualPath].cats)[0].id;
        viewModel.set("isBusy",false);

    }, (e) => {
        //console.log(e);
        pathsFromServer = JSON.parse(appSettings.getString("availablePaths","null"));
        //console.log(pathsFromServer);

        paths = Object.values(pathsFromServer).filter( path => path.enabled == 1);
        pathsObject = pathsFromServer;
        viewModel.set("listOfPaths", paths);
        viewModel.set("listOfCats", Object.values(paths[0].cats));
        viewModel.set("selectedItem", 0);
        viewModel.set("selectedItem2", 0);
        actualPath = paths[0].id;
        actualCat = Object.values(pathsObject[actualPath].cats)[0].id;

        const alertOptions = {
            title: 'Avviso',
            message: 'Sei offline: la lista dei percorsi non è sincronizzata. Per sincronizzare i percorsi, collega il telefono a internet e riprova!',
            okButtonText: 'OK',
            cancelable: false // [Android only] Gets or sets if the dialog can be canceled by taping outside of the dialog.
          }
        
        Dialogs.alert(alertOptions);
        viewModel.set("isBusy",false);
    });
}

viewModel.onListPickerLoaded = (args)  => {
    const listPicker = args.object;
    listPicker.on("selectedIndexChange", (lpargs) => {
        const picker = lpargs.object;
        actualPath = paths[picker.selectedIndex].id;
        actualCat = Object.values(pathsObject[actualPath].cats)[0].id;        
        //console.log(actualPath+ " -> "+actualCat);

        viewModel.set("listOfCats", Object.values(paths[picker.selectedIndex].cats));
    });
};

viewModel.onListPickerLoaded2 = (args)  => {
    const listPicker = args.object;
    listPicker.on("selectedIndexChange", (lpargs) => {
        const picker = lpargs.object;
        actualCat = Object.values(pathsObject[actualPath].cats)[picker.selectedIndex].id;
        //console.log(actualPath+ " -> "+actualCat);
    });
};

viewModel.goToRun = () => {
    //console.log("State before: "+actualPath+" "+actualCat);

    if(nfcstate==1){
        appSettings.setNumber("idActualPath", actualPath);
        appSettings.setNumber("idActualCat", actualCat);

        appSettings.setBoolean("path_is_selected", true);

        Frame.topmost().navigate({
            moduleName: "home/home-run",
            context: { runSelected: true, actualPath: actualPath, actualCat: actualCat },
            clearHistory: true,
            transition: {
                name: "fade"
            }
        });
    }
};

/*
    END HELPER FUNCTIONS SECTION
*/

function HomeViewModel(localpage) {
    //console.log("State Home:" + appSettings.getNumber("state_timestate", 0));
    if(appSettings.getNumber("state_timestate", 0) != 0){
        Frame.topmost().navigate({
            moduleName: "home/home-run",
            clearHistory: true
        });
    }

    SelectedPageService.getInstance().updateSelectedPage("Home");
    viewModel.set("isBusy",true);

    checkSession("Home");

    viewModel.set("goToRunText","Seleziona la corsa");
    viewModel.set("goToRunColor","green");
    viewModel.set("nfcColorStatus","green");

    updatePaths();
    if (global.isAndroid) {
        Application.android.on("activityResumed", () => {
            checkNFCState(false);
        });
    }

    function checkNFCState(showDialog){
        if(nfcstate != -1) {
            
            nfc.enabled().then(function (on) {
                //console.log(on ? "Yes" : "No");
                if(on){
                    viewModel.set("nfcColorStatus","green");
                    viewModel.set("goToRunColor","green");
                    viewModel.set("nfcText", "SENSORE NFC ON");
                    nfcstate = 1;
                } else {
                    viewModel.set("nfcColorStatus","red");
                    viewModel.set("goToRunColor","red");
                    viewModel.set("nfcText", "SENSORE NFC OFF");
                    const alertOptions = {
                        title: 'Avviso',
                        message: "Sembra che il tuo telefono abbia il sensore NFC disattivato o non hai fornito all'applicazione le necessarie autorizzazioni. Controlla le impostazioni e riavvia l'app.",
                        okButtonText: 'OK',
                        cancelable: false // [Android only] Gets or sets if the dialog can be canceled by taping outside of the dialog.
                      }
                    
                    if(showDialog){
                    Dialogs.alert(alertOptions).then(() => {
                        if (global.isAndroid) {
                            openNFCSettings();
                        }
                    });
                    }
                    
                    nfcstate = 0;
                }
            });
        }
    }
    // Describe action on tapping NFC STATUS button
    viewModel.onTapNFC = () => {
        checkNFCState(true); 
    };

    // Checks whether NFC is available
    nfc.available().then(function (avail) {
        if(avail){
            viewModel.set("nfcText", "TELEFONO COMPATIBILE");
            nfcstate = 0;
            nfc.enabled().then(function (on) {
                //console.log(on ? "Yes" : "No");
                if(on){
                    viewModel.set("nfcColorStatus","green");
                    viewModel.set("goToRunColor","green");
                    viewModel.set("nfcText", "SENSORE NFC ON");
                    nfcstate = 1;
                } else {
                    viewModel.set("nfcColorStatus","red");
                    viewModel.set("goToRunColor","red");
                    viewModel.set("nfcText", "SENSORE NFC OFF");
                    const alertOptions = {
                        title: 'Avviso',
                        message: "Sembra che il tuo telefono abbia il sensore NFC disattivato o non hai fornito all'applicazione le necessarie autorizzazioni. Per aprire le impostazioni, clicca sul bottone rosso", 
                        okButtonText: 'OK',
                        cancelable: false // [Android only] Gets or sets if the dialog can be canceled by taping outside of the dialog.
                      }
                    Dialogs.alert(alertOptions).then(() => {
                        // if (global.isAndroid) {
                        //     openNFCSettings();
                        // }
                    });
                    nfcstate = 0;
                }
            });
        } else {
            viewModel.set("nfcColorStatus","red");
            viewModel.set("goToRunColor","red");
            viewModel.set("nfcText", "TELEFONO NON COMPATIBILE");
            const alertOptions = {
                title: 'Avviso',
                message: "Purtroppo il tuo telefono non supporta la tecnologia NFC.",
                okButtonText: 'OK',
                cancelable: false // [Android only] Gets or sets if the dialog can be canceled by taping outside of the dialog.
              }
            
            Dialogs.alert(alertOptions);
            nfcstate = -1;
        } 
    });
      
    return viewModel;
}

module.exports = HomeViewModel;
