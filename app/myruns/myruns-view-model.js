const Observable = require("@nativescript/core").Observable;
const viewModel = new Observable();

// Load module fs
const fileSystemModule = require("@nativescript/core/file-system");
// Load module observable array
const ObservableArray = require("@nativescript/core/data/observable-array").ObservableArray;
// Load module dialogs
const Dialogs = require("@nativescript/core").Dialogs;
const httpModule = require("@nativescript/core/http");

const getFrameById = require("@nativescript/core/ui/frame").getFrameById;
const { Frame } = require("@nativescript/core");
const appSettings = require("@nativescript/core/application-settings");
const checkSession = require("../shared/check-session");


// Example using `getFrameById(frameId)` to get a `Frame` reference
// As an alternative, we could use `topmost()` method or `page.frame` property

var listaCorse = new ObservableArray();

const SelectedPageService = require("../shared/selected-page-service");

viewModel.onItemTap = (args) => {
    
    // Dialogs.confirm({
    //     title: "Console",
    //     message: ""+listaCorse[args.index],
    //     okButtonText: "OK",
    //     cancelButtonText: "NO",
    //     neutralButtonText: "ANNULLA"
    // });
    //console.log(listaCorse.getItem(args.index).name);
    Frame.topmost().navigate({
        moduleName: "myruns/run-page",
        context: { runfile: listaCorse.getItem(args.index).name },
        transition: {
            name: "fade"
        }
    });

};

var notifyLogin = false;

function BrowseViewModel() {
    SelectedPageService.getInstance().updateSelectedPage("Browse");
    viewModel.set("isBusy",true);

    checkSession("Browse");

    const documentsFolder = fileSystemModule.knownFolders.documents();
    const folder = documentsFolder.getFolder("runnings");

    let pathsFromServer = JSON.parse(appSettings.getString("availablePaths","null"));
    listaCorse = new ObservableArray();
    viewModel.set("listaCorse", listaCorse);

    let filesArray = new Array();
    folder.getEntities()
        .then((entities) => {
            // entities is an array of files and folders.
            entities.forEach((entity) => {
                filesArray.push(entity.name);
            });

            // Pull runs from server!
            var reqObj = {};
            reqObj.payload = filesArray;
            reqObj.runnerId = appSettings.getString("loggedUserId", 0);
            reqObj.token = appSettings.getString("loginToken", "null");
            //console.log(JSON.stringify(reqObj));

            if(appSettings.getBoolean("isUserLoggedIn", false)){
                fetch("https://wiro.scom-mendrisio.ch/API/synch_pull.php", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(reqObj)
                }).then((r) => r.json())
                    .then((response) => {
                        //console.log(response);
                        if(response.valid && response.update) {
                            addNextNew(response.payload);
                        } else {
                            //console.log(filesArray.sort());
                            addNext(filesArray.sort());
                        }
                    }).catch((e) => {
                        //console.log("hi"+e);
                        addNext(filesArray.sort());
                    });
            } else {
                addNext(filesArray.sort());
            }
                
            
        }).catch((err) => {
            // Failed to obtain folder's contents.
            //console.log(err);
        });

    function addNextNew(array){
        if(array.length == 0){
            addNext(filesArray.sort());
            return;
        }

        let item = array.pop();

        let newFile = folder.getFile(item.filename);
        newFile.writeText(JSON.stringify(item))
            .then((result) => {
                //console.log("saved");
                filesArray.push(item.filename);
                //console.log("Pull from server "+item.filename);
                addNextNew(array);
            }).catch((err) => {
                //console.log("Err pull from server "+item.filename+" -> "+err);
                addNext(filesArray.sort());
            });
    }
        
    function addNext(array){
        if(array.length == 0){
            viewModel.set("isBusy",false);
            if(notifyLogin){
                const alertOptions = {
                    title: 'Sincronizzazione percorsi',
                    message: 'Hai registrato alcuni percorsi ma non hai eseguito il login. Per controllare e sincronizzare i percorsi, deve eseguire prima il login!',
                    okButtonText: 'OK',
                    cancelable: true // [Android only] Gets or sets if the dialog can be canceled by taping outside of the dialog.
                  }
                
                  Dialogs.alert(alertOptions);
            }
            return;
        }
        let next = array.pop();

        var file = folder.getFile(next);

        file.readText().then((res) => {
            //console.log(res);
            var single = {};
            single.name = next
            pres = JSON.parse(res);
            if(pathsFromServer[pres.pathId]){
                single.pathId = pathsFromServer[pres.pathId].name;
                //console.log(pres);
                let mydate = Date.parse(pres.data[0][1]);
                    //console.log(runObject.data[0][1]);
                    var data = new Date(mydate); 
                    var set, gg, mm, aaaa, h, m, s; //Crea la tabella dei mesi 
                    var mesi = new Array(); mesi[0] = "Gen"; mesi[1] = "Feb"; mesi[2] = "Mar"; mesi[3] = "Apr"; mesi[4] = "Mag"; mesi[5] = "Giu"; mesi[6] = "Lug"; mesi[7] = "Ago"; mesi[8] = "Set"; mesi[9] = "Ott"; mesi[10] = "Nov"; mesi[11] = "Dic"; 
                    var giorni = new Array(); giorni[0] = "Dom"; giorni[1] = "Lun"; giorni[2] = "Mar"; giorni[3] = "Mer"; giorni[4] = "Gio"; giorni[5] = "Ven"; giorni[6] = "Sab"; 
                    set = giorni[data.getDay()] + ", "; gg = data.getDate() + " "; 
                    mm = mesi[data.getMonth()] + " "; 
                    aaaa = data.getFullYear(); 
                    h = data.getHours() + ":"; 
                    m = data.getMinutes(); 
                    if(h<10){
                        h = "0"+h;
                    }
                    if(m<10){
                        m = "0"+m;
                    }
                    s = data.getSeconds(); 
                single.Date = set + gg + mm + aaaa + ", " + h + m;
                
                if(!appSettings.getBoolean("isUserLoggedIn", false) && pres.runnerId == 0){
                    notifyLogin = true;
                } else if (appSettings.getBoolean("isUserLoggedIn", false)){
                    notifyLogin = false;
                }

                // Single-Push-Synch.
                if(!pres.synchronized && appSettings.getBoolean("isUserLoggedIn", false)){
                    if(pres.runnerId == 0){
                        pres.runnerId = appSettings.getString("loggedUserId", "0");
                        pres.runnerName = appSettings.getString("loggedUserName","null");
                    }
                    var reqObj = {};
                    reqObj.payload = pres;
                    reqObj.file_name = next;
                    reqObj.token = appSettings.getString("loginToken", "null");
                    //console.log("pull: "+JSON.stringify(reqObj));
                    fetch("https://wiro.scom-mendrisio.ch/API/synch.php", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(reqObj)
                    }).then((r) => r.json())
                        .then((response) => {
                            //console.log(response);
                            if(response.valid && response.synched) {
                                // IS synchronized
                                pres.synchronized = true;
                                pres.status = response.status;
                                single.isSynch = true;
                                // Re-write file! And ignore fail
                                let newFile = folder.getFile(next);
                                newFile.writeText(JSON.stringify(pres))
                                    .then((result) => {
                                        //console.log("saved");
                                        //console.log("wrote: "+JSON.stringify(pres));
                                    }).catch((err) => {
                                        //console.log(err);
                                    });
                            } 
                            listaCorse.push(single);
                            addNext(array)
                        }).catch((e) => {
                            //console.log(e);
                            if(pres.synchronized){
                                single.isSynch = true;
                            } else {
                                single.isSynch = false;
                            }
                            listaCorse.push(single);
                            addNext(array)
                        });
                } else {
                    if(pres.synchronized){
                        single.isSynch = true;
                    } else {
                        single.isSynch = false;
                    }
                    listaCorse.push(single);
                    addNext(array)
                }
                //single.isSynch = pres.synchronized;
            } else {
                single.pathId = "Test";
                single.Date = "Unknown";
                single.isSynch = false;
            }
        }).catch((err) => {
            //console.log(err.stack);
        });
    }

    return viewModel;
}

module.exports = BrowseViewModel;
