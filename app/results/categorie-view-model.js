const Observable = require("@nativescript/core").Observable;
const viewModel = new Observable();

// Load module fs
const fileSystemModule = require("@nativescript/core/file-system");
// Load module dialogs
const Dialogs = require("@nativescript/core").Dialogs;
const appSettings = require("@nativescript/core/application-settings");
const { Frame } = require("@nativescript/core");

viewModel.onItemTap = (args) => {
    
    Frame.topmost().navigate({
        moduleName: "results/classifica",
        context: { gara: garaId, categoria: cats[args.index].id},
        transition: {
            name: "fade"
        }
    });

};

var garaId;
var cats;

function BrowseViewModel(context) {
    //SelectedPageService.getInstance().updateSelectedPage("Browse");
    viewModel.set("isBusy",true);

    pathsFromServer = JSON.parse(appSettings.getString("availablePaths","null"));
    theGara = Object.values(pathsFromServer)[context.gara];
    garaId = theGara.id;
    //console.log(theGara);
    viewModel.set("titoloPercorso", theGara.name);

    cats = Object.values(theGara.cats);
    //console.log(cats);

    viewModel.set("listaCorse", cats);
    viewModel.set("isBusy",false);


    return viewModel;
}

module.exports = BrowseViewModel;