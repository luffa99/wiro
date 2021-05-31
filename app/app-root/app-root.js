const { Frame, Application } = require("@nativescript/core");

const AppRootViewModel = require("./app-root-view-model");
const appSettings = require("@nativescript/core/application-settings");

function onLoaded(args) {
    const drawerComponent = args.object;
    drawerComponent.bindingContext = new AppRootViewModel();
}

function onNavigationItemTap(args) {
    const component = args.object;
    var componentRoute = component.route;
    const componentTitle = component.title;
    const bindingContext = component.bindingContext;

    if(componentRoute =='home/home-run'){
        if(!appSettings.getBoolean("path_is_selected", false)){
            componentRoute = 'home/home-page';
        }
    }

    bindingContext.set("selectedPage", componentTitle);

    Frame.topmost().navigate({
        moduleName: componentRoute,
        clearHistory: true,
        transition: {
            name: "fade"
        },
    });

    const drawerComponent = Application.getRootView();
    drawerComponent.closeDrawer();
}

exports.onLoaded = onLoaded;
exports.onNavigationItemTap = onNavigationItemTap;
