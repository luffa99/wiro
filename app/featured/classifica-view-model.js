const Observable = require("@nativescript/core").Observable;
const viewModel = new Observable();

const fileSystemModule = require("@nativescript/core/file-system");
const Dialogs = require("@nativescript/core").Dialogs;
const appSettings = require("@nativescript/core/application-settings");
const { Frame } = require("@nativescript/core");

viewModel.onButtonTap = (args) => {
    
    viewModel.set("isBusy",true);
    Frame.topmost().navigate({
        moduleName: "featured/intertempi",
        context: { gara: garaId, categoria: categoriaId},
        transition: {
            name: "fade"
        }
    });

};
var garaId;
var categoriaId;

function BrowseViewModel(context) {
    //SelectedPageService.getInstance().updateSelectedPage("Browse");
    viewModel.set("isBusy",true);

    //console.log(context.gara + " "+context.categoria);
    if(!context.gara || !context.categoria){
        Frame.goBack();
    }

    garaId = context.gara;
    categoriaId = context.categoria;

    pathsFromServer = JSON.parse(appSettings.getString("availablePaths","null"));
    //console.log(pathsFromServer[context.gara].cats);

    viewModel.set("titoloPercorso",pathsFromServer[context.gara].name + " | "+pathsFromServer[context.gara].cats[context.categoria].name);
    viewModel.set("distanza", pathsFromServer[context.gara].cats[context.categoria].length+" km");
    viewModel.set("dislivello", pathsFromServer[context.gara].cats[context.categoria].climb+" m");
    var noRunner = {}
    noRunner.name = "Ancora nessun corridore";
    var conErr = {}
    conErr.name = "Errore di connessione";
    var reqObj = {}
    reqObj.path = context.gara;
    reqObj.cat = context.categoria;
    reqObj.userId = appSettings.getString("loggedUserId", 0);
    //console.log(JSON.stringify(reqObj));
    fetch("https://wiro.scom-mendrisio.ch/API/getRanks.php", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(reqObj)
                }).then((r) => r.json())
                    .then((response) => {
                        //console.log(response);
                        if(response.valid && !response.empty) {
                            viewModel.set("listaCorse", response.payload);
                            viewModel.set("isBusy",false);
                            viewModel.set("connection", true);
                        } else if (response.valid) {
                            viewModel.set("listaCorse", [noRunner]);
                            viewModel.set("isBusy",false);
                            viewModel.set("connection", false);
                        } else {
                            viewModel.set("isBusy",false);
                            viewModel.set("listaCorse", [conErr]);
                            viewModel.set("connection", false);
                        }
                    }).catch((e) => {
                        //console.log("hi"+e);
                        viewModel.set("listaCorse", [conErr]);
                        viewModel.set("connection", false);
                        viewModel.set("isBusy",false);
                        Dialogs.alert({
                            title: "Errore",
                            message: "Sei offline. La funzione classifiche è disponibile solo online.",
                            okButtonText: "OK"
                        }).then(function () {
                            Frame.goBack();
                        });
                    });

    //viewModel.set("isBusy",false);


    return viewModel;
}

module.exports = BrowseViewModel;