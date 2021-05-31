const Observable = require("@nativescript/core").Observable;
const viewModel = new Observable();

// Load module fs
const fileSystemModule = require("@nativescript/core/file-system");
// Load module dialogs
const Dialogs = require("@nativescript/core").Dialogs;
const appSettings = require("@nativescript/core/application-settings");
const { Frame } = require("@nativescript/core");

/**
 * Returns string with formatted time hh:mm:ss with difference of arg1 - arg2, both of type Date
 * If no arguments are passed, it returns the difference btw starttime and now
 */
 function getTimeDiff(now = new Date(), localstarttime){
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

viewModel.onButtonTap = (args) => {
    
    viewModel.set("isBusy",true);
    Frame.topmost().navigate({
        moduleName: "results/classifica",
        context: { gara: garaId, categoria: categoriaId},
        transition: {
            name: "fade"
        }
    });

};

viewModel.onDelete = (args) => {
    
    const actionOptions = {
        title: 'Cancellare definitivamente la corsa',
        message: 'Sei sicuro di voler cancellare la corsa? Verrà eliminata definitivamente e non potrà essere recuperata!',
        okButtonText: 'Si, elimina',
        cancelButtonText: 'No',
        neutralButtonText: 'Annulla'    
      }
    
      Dialogs.confirm(actionOptions).then(result => {
        if (result) {
          // Do action 1
            const documents = fileSystemModule.knownFolders.documents();
            const folder = documents.getFolder("runnings");
            const file = folder.getFile(filename);

            var reqObj = {};
            reqObj.runnerId = appSettings.getString("loggedUserId", "0");
            reqObj.file_name = filename;
            reqObj.token = appSettings.getString("loginToken", "null");
            //console.log(JSON.stringify(reqObj));
            fetch("https://wiro.scom-mendrisio.ch/API/delete.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(reqObj)
            }).then((r) => r.json())
                .then((response) => {
                    //console.log(response);
                    file.remove()
                        .then((res) => {
                            // Success removing the file.
                            const alertOptions = {
                                title: 'Avviso',
                                message: "Corsa cancellata.",
                                okButtonText: 'OK',
                                cancelable: false // [Android only] Gets or sets if the dialog can be canceled by taping outside of the dialog.
                            }
                            
                            Dialogs.alert(alertOptions).then(() => {
                                Frame.topmost().navigate({
                                    moduleName: "myruns/myruns-page",
                                    transition: {
                                        name: "fade"
                                    }
                                });
                            });
                            
                        }).catch((err) => {
                            const alertOptions = {
                                title: 'Avviso',
                                message: "Errore nella cancellazione della corsa.",
                                okButtonText: 'OK',
                                cancelable: false // [Android only] Gets or sets if the dialog can be canceled by taping outside of the dialog.
                            }
                            
                            Dialogs.alert(alertOptions).then(() => {
                                Frame.topmost().navigate({
                                    moduleName: "myruns/myruns-page",
                                    transition: {
                                        name: "fade"
                                    }
                                });
                            })
                        });
                    
                }).catch((e) => {
                    //console.log(e);
                    const alertOptions = {
                        title: 'Avviso',
                        message: "Errore nella cancellazione della corsa. Per cancellare la corsa è necessario aver eseguito il login, essere i proprietari della corsa ed essere collegati ad internet!",
                        okButtonText: 'OK',
                        cancelable: false // [Android only] Gets or sets if the dialog can be canceled by taping outside of the dialog.
                    }
                    
                    Dialogs.alert(alertOptions).then(() => {
                        Frame.topmost().navigate({
                            moduleName: "myruns/myruns-page",
                            transition: {
                                name: "fade"
                            }
                        });
                    });
                });
            //console.log("ciao");
        } 
      })

};

var garaId;
var categoriaId;
var filename;

function BrowseViewModel(context) {
    //SelectedPageService.getInstance().updateSelectedPage("Browse");
    const documents = fileSystemModule.knownFolders.documents();
    const folder = documents.getFolder("runnings");
    const file = folder.getFile(context.runfile);
    filename = context.runfile;

    let runarray = new Array();
    let pathsFromServer = JSON.parse(appSettings.getString("availablePaths","null"));

    //console.log(context.runfile);

    file.readText()
            .then((res) => {
               runObject = JSON.parse(res);
               garaId = runObject.pathId;
               categoriaId = runObject.catId;

                //console.log(res);
            //    console.log(runObject.data[0][1]);

               // Parse timing data
               let nrpunto = 1;
               let starttime;
               let tottime;
               for(let i=0; i < runObject.data.length; i++){
                   if (runObject.data[i][0] == "START" || runObject.data[i][0] == "START_M"){
                       runarray.push("START                      ");
                       starttime = new Date(runObject.data[i][1]);
                   } else if (runObject.data[i][0] == "FINISH" || runObject.data[i][0] == "FINISH_M") {
                        runarray.push("FINISH" + "   "+ getTimeDiff(new Date(runObject.data[i][1]), starttime) + "  " + getTimeDiff(new Date(runObject.data[i][1]), new Date(runObject.data[i-1][1])));
                        tottime = getTimeDiff(new Date(runObject.data[i][1]), starttime);
                   } else {
                        var nrpuntostring = nrpunto < 10 ? nrpunto+" " : nrpunto;
                        var nrlanternastr = runObject.data[i][0] < 100 ? runObject.data[i][0]+" " : runObject.data[i][0];
                        runarray.push(nrpuntostring + "  " + nrlanternastr + "  " + getTimeDiff(new Date(runObject.data[i][1]), starttime)+ "  " + getTimeDiff(new Date(runObject.data[i][1]), new Date(runObject.data[i-1][1])));
                        nrpunto++;
                   }
               }
            //    console.log(runarray); 

               let nomePercorso = pathsFromServer[runObject.pathId].name;
               let mydate = Date.parse(runObject.data[0][1]);
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
                    s = data.getSeconds(); 
                    if(h<10){
                        h = "0"+h;
                    }
                    if(m<10){
                        m = "0"+m;
                    }
               let dataPercorso = set + gg + mm + aaaa + ", ore " + h + m;
               let nomeCategoria = pathsFromServer[runObject.pathId].cats[runObject.catId].name;
               viewModel.set("totTime", tottime);
               viewModel.set("titoloPercorso", nomePercorso);
               viewModel.set("titoloCat", nomeCategoria);
               viewModel.set("dataPercorso", dataPercorso);
               viewModel.set("listaPunti",runarray);
               viewModel.set("corridore",runObject.runnerName);
               if(runObject.synchronized){
                    if(runObject.status == 0) {
                        viewModel.set("statoGara","O.K.");
                    } else if (runObject.status == 1) {
                        viewModel.set("statoGara","Po.f.");
                    } else if (runObject.status == 2) {
                        viewModel.set("statoGara","Squal.");
                    } else if (runObject.status == 3) {
                        viewModel.set("statoGara","Rit.");
                    } else {
                        viewModel.set("statoGara","Non Controllato");
                    }
               } else {
                    viewModel.set("statoGara","Non Controllato");
               }

            });



    return viewModel;
}

module.exports = BrowseViewModel;
