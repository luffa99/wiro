const core = require("@nativescript/core");

const _isAndroid = !!core.Application.android;
const _isIOS = !!core.Application.ios;

const SelectedPageService = require("../shared/selected-page-service");
const Observable = require("@nativescript/core").Observable;
const viewModel = new Observable();


function SettingsViewModel(thepage) {
    SelectedPageService.getInstance().updateSelectedPage("Impostazioni");
    if (_isAndroid) {
        // Android code here
        viewModel.setProperty("url","https://wiro.scom-mendrisio.ch/support/android");
    } else if (_isIOS) {
        // iOS code here
        viewModel.setProperty("url","https://wiro.scom-mendrisio.ch/support/ios");
    }
    return viewModel;
}

module.exports = SettingsViewModel;
