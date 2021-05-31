const core = require("@nativescript/core");
const Observable = require("@nativescript/core").Observable;
const viewModel = new Observable();
const httpModule = require("@nativescript/core/http");
const appSettings = require("@nativescript/core/application-settings");
const { Frame } = require("@nativescript/core");

const SelectedPageService = require("../shared/selected-page-service");

var paths;

function updatePaths() {
    httpModule.getJSON("https://wiro.scom-mendrisio.ch/API/getPaths.php").then((r) => {

        //console.log(r);
        pathsFromServer = r.payload;

        if(r.md5 != appSettings.getString("pathsUpdateHash","null")){
            appSettings.setString("availablePaths", JSON.stringify(pathsFromServer));
            appSettings.setString("pathsUpdateHash", r.md5);
        } else {
            pathsFromServer = JSON.parse(appSettings.getString("availablePaths","null"));          
        }

        paths = Object.values(pathsFromServer);

        viewModel.set("listaCorse", paths);
        viewModel.set("isBusy",false);

    }, (e) => {
        //console.log(e);
        pathsFromServer = JSON.parse(appSettings.getString("availablePaths","null"));

        paths = Object.values(pathsFromServer);
        viewModel.set("listaCorse", paths);
        viewModel.set("isBusy",false);
    });
}

viewModel.onItemTap = (args) => {
    
    Frame.topmost().navigate({
        moduleName: "results/categorie",
        context: { gara: args.index },
        transition: {
            name: "fade"
        }
    });

};

function FeaturedViewModel() {
    SelectedPageService.getInstance().updateSelectedPage("Results");

    // listaCorse = new ObservableArray();
    // viewModel.set("listaCorse", listaCorse);

    updatePaths();

    return viewModel;
}

module.exports = FeaturedViewModel;
