const app = require("@nativescript/core").Application;

const BrowseViewModel = require("./run-view-model");
const { Frame } = require("@nativescript/core");


function onNavigatingTo(args) {
    const page = args.object;
    page.bindingContext = new BrowseViewModel(args.context);
}

function onDrawerButtonTap(args) {
    // const sideDrawer = app.getRootView();
    // sideDrawer.showDrawer();
    Frame.goBack();
}

exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;
