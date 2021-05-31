const core = require("@nativescript/core");

const SelectedPageService = require("../shared/selected-page-service");
const Observable = require("@nativescript/core").Observable;
const viewModel = new Observable();

const httpModule = require("@nativescript/core/http");
const Dialogs = require("@nativescript/core").Dialogs;
const appSettings = require("@nativescript/core/application-settings");
const checkSession = require("../shared/check-session");
const utils = require("@nativescript/core/utils/utils");

var isLoggedIn = false;

viewModel.onButtonTap = (btargs) => {
    if (global.isIOS) {
        UIApplication.sharedApplication.keyWindow.endEditing(true);
    }
    if (global.isAndroid) {
        utils.ad.dismissSoftInput();
    }
    let srcButton = btargs.object;
    //console.log(srcButton.id);
    let user_name = srcButton.page.getViewById("user_name").text;
    let user_pass = srcButton.page.getViewById("user_pass").text;
    httpModule.request({
        url: "https://wiro.scom-mendrisio.ch/API/login.php",
        method: "POST",
        content: "type="+srcButton.id+"&username="+user_name+"&password="+user_pass
    }).then((response) => {
        //console.log(response.content);
        var obj = response.content.toJSON();
        if(!obj.valid){

            Dialogs.alert({
                title: "Errore",
                message: "Login invalido, riprovare.",
                okButtonText: "OK"
            }).then(function () {
            });

            srcButton.page.getViewById("user_pass").text = "";
        } else {
            appSettings.setBoolean("isUserLoggedIn", true);
            appSettings.setString("loginToken", obj.token);
            appSettings.setString("loggedUserId", obj.userid);
            appSettings.setString("loggedUserName", obj.name);
            appSettings.setString("loggedUserEmail", obj.email);
            srcButton.page.getViewById("user_name").text = "";
            srcButton.page.getViewById("user_pass").text = "";
            isLoggedIn = true;
            viewModel.set("isLoggedIn",true);
            viewModel.set("welcomeText2","Account di: "+appSettings.getString("loggedUserName", "tu"));  
            SelectedPageService.getInstance().updateSelectedPage("Settings");
            Dialogs.alert({
                title: "Successo",
                message: "Login effettuato.",
                okButtonText: "OK"
            }).then(function () {

            });
        }
    }, (e) => {
        Dialogs.alert({
            title: "Errore",
            message: "Impossibile collegarsi a internet. Controllare le impostazioni e riprovare.",
            okButtonText: "OK"
        }).then(function () {

        });
    });
  };

  viewModel.onButtonTapLogout = (btargs) => {
      console.log("schiacciato")
    const confirmOptions = {
        title: 'Logout',
        message: 'Sei sicuro di voler eseguire il log-out?',
        okButtonText: 'Si',
        cancelButtonText: 'No',
        neutralButtonText: 'Annulla'
      }
    
      Dialogs.confirm(confirmOptions).then(result => {
        if(result){
            let reqObj = {};
            reqObj.runnerId = appSettings.getString("loggedUserId", "NULL");
            reqObj.token = appSettings.getString("loginToken", "NULL");
            fetch("https://wiro.scom-mendrisio.ch/API/logout.php", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(reqObj)
                    });
            appSettings.setBoolean("isUserLoggedIn", false);
            appSettings.remove("loginToken");
            appSettings.remove("loggedUserId");
            appSettings.remove("loggedUserName");
            appSettings.remove("loggedUserEmail");
            isLoggedIn = false;
            viewModel.set("isLoggedIn",false);
            viewModel.set("welcomeText","Esegui il Login per sincronizzare e controllare le corse!");
            SelectedPageService.getInstance().updateSelectedPage("Settings");
        }
      })
    
  }

function SettingsViewModel(thepage) {
    SelectedPageService.getInstance().updateSelectedPage("Settings");

    checkSession("Settings");

    isLoggedIn = appSettings.getBoolean("isUserLoggedIn", false);

    viewModel.set("isLoggedIn",isLoggedIn);

    if (isLoggedIn){
        viewModel.set("welcomeText2","Account di: "+appSettings.getString("loggedUserName", "tu"));   
    } 
    viewModel.set("welcomeText","Esegui il Login per sincronizzare e controllare le corse!");
    

    return viewModel;
}

module.exports = SettingsViewModel;
