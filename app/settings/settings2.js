
const app = require("@nativescript/core").Application;

const SettingsViewModel = require("./settings2-view-model");

function onNavigatingTo(args) {
    const page = args.object;
    page.bindingContext = new SettingsViewModel();
}

function onDrawerButtonTap(args) {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}

exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;
