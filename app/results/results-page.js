const app = require("@nativescript/core").Application;

const FeaturedViewModel = require("./results-view-model");

function onNavigatingTo(args) {
    const page = args.object;
    //console.log(args.context);
    page.bindingContext = new FeaturedViewModel();
}

function onDrawerButtonTap(args) {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}

exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;
