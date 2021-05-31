const core = require("@nativescript/core");

const SelectedPageService = require("../shared/selected-page-service");
const appSettings = require("@nativescript/core/application-settings");

function AppRootViewModel() {
    const viewModel = core.fromObject({
        selectedPage: ""
    });

    SelectedPageService.getInstance().selectedPage$
    .subscribe((selectedPage) => { 
        viewModel.selectedPage = selectedPage; 
        if(appSettings.getBoolean("isUserLoggedIn", false)) {
            viewModel.set("user_name", appSettings.getString("loggedUserName", ""));
            viewModel.set("user_email", appSettings.getString("loggedUserEmail", ""));
        } else {
            viewModel.set("user_name", "Ospite");
            viewModel.set("user_email", "Effettua il login");
        }
    });

    if(appSettings.getBoolean("isUserLoggedIn", false)) {
        viewModel.set("user_name", appSettings.getString("loggedUserName", ""));
        viewModel.set("user_email", appSettings.getString("loggedUserEmail", ""));
    } else {
        viewModel.set("user_name", "Ospite");
        viewModel.set("user_email", "Effettua il login");
    }

    return viewModel;
}

module.exports = AppRootViewModel;
