const core = require("@nativescript/core");

const SelectedPageService = require("../shared/selected-page-service");
const Observable = require("@nativescript/core").Observable;
const viewModel = new Observable();

const httpModule = require("@nativescript/core/http");
const Dialogs = require("@nativescript/core").Dialogs;
const appSettings = require("@nativescript/core/application-settings");
const checkSession = require("../shared/check-session");
const { Frame } = require("@nativescript/core");

viewModel.onButtonTap = (btargs) => {
    let mySwitch = btargs.object;
    appSettings.setBoolean("keepAwake",mySwitch.checked)
    //console.log(mySwitch.checked);
  };

  viewModel.onButtonTap2 = (btargs) => {

        Frame.topmost().navigate({
            moduleName: "settings/support",
            transition: {
                name: "fade"
            }
        });
    
  };

function SettingsViewModel(thepage) {
    SelectedPageService.getInstance().updateSelectedPage("Impostazioni");


    viewModel.set("keepAwakePage",appSettings.getBoolean("keepAwake",false));


    return viewModel;
}

module.exports = SettingsViewModel;
