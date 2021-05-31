var userHasAckOfflineNotification = false;
const Dialogs = require("@nativescript/core").Dialogs;
const appSettings = require("@nativescript/core/application-settings");
const SelectedPageService = require("../shared/selected-page-service");

function checkSession(pagename){
    if(appSettings.getBoolean("isUserLoggedIn", false)) {
        var reqObj = {};
            reqObj.runnerId = appSettings.getString("loggedUserId", 0);
            reqObj.token = appSettings.getString("loginToken", "null");

        fetch("https://wiro.scom-mendrisio.ch/API/checkSession.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(reqObj)
        }).then((r) => r.json())
            .then((response) => {
                if(response.valid && response.login) {
                    // OK
                    //console.log("session ok");
                } else {
                    // DO LOGOUT!
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
                    SelectedPageService.getInstance().updateSelectedPage(pagename);
                    Dialogs.alert({
                        title: "Sessione invalida",
                        message: "La tua sessione è invalida e pertanto è stato eseguito il log-out. Prova a rieseguire il log-in.",
                        okButtonText: "OK"
                    }).then(function () {
        
                    });
                }
            }).catch((e) => {
                //console.log(e);
            });
    } 
}

module.exports = checkSession;
