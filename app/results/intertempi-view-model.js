const Observable = require("@nativescript/core").Observable;
const viewModel = new Observable();

const fileSystemModule = require("@nativescript/core/file-system");
const Dialogs = require("@nativescript/core").Dialogs;
const appSettings = require("@nativescript/core/application-settings");
const { Frame } = require("@nativescript/core");

const tabViewModule = require("@nativescript/core/ui/tab-view");
const stackLayoutModule = require("@nativescript/core/ui/layouts/stack-layout");
const labelModule = require("@nativescript/core/ui/label");
const scrollViewModule = require("@nativescript/core/ui/scroll-view");
const gridLayoutModule = require("@nativescript/core/ui/layouts/grid-layout");

const userId = appSettings.getString("loggedUserId", 0);
const start = '\u25B7';
const end = '\u233E';
const to = '\u290F';

function generateItems(tabs, payload) {
    var items = [];
    var prevStation = start;
    for(let i=0; i<= tabs.length; i++){
        const stackLayout0 = new stackLayoutModule.StackLayout();
        const scrollView0 = new scrollViewModule.ScrollView();

        let rank = 1;
        payload[i].forEach( (ob) => {
            const gridLayout0 = new gridLayoutModule.GridLayout();
            gridLayout0.columnSpan = "auto, auto, *";
            gridLayout0.rowSpan = "auto"
                const label0 = new labelModule.Label();
                label0.text = (rank++)+".";
                label0.row = "0";
                label0.col = "0";
                label0.style = "font-size: 18; padding-left: 15";

                const label1 = new labelModule.Label();
                label1.text = ob.user_name;
                label1.row = "0";
                label1.col = "1";
                label1.style = "font-size: 18; padding-left: 45;";

                const label2 = new labelModule.Label();
                label2.text = ob.time_split;
                label2.row = "0";
                label2.col = "2";
                label2.textAlignment = "right";
                label2.style = "font-size: 18; padding-right: 20;";
            gridLayout0.addChild(label0);
            gridLayout0.addChild(label1);
            gridLayout0.addChild(label2);
            gridLayout0.style="padding-bottom: 10; padding-top: 10; border-width: 0 0 0.5 0; border-color: Lightgrey";

            if(ob.user_id == userId){
                gridLayout0.style=" background-color: #F1F1F1";
            }

            stackLayout0.addChild(gridLayout0);
            // const bar = new stackLayoutModule.StackLayout();
            // bar.className = "hr";
            // stackLayout0.addChild(bar);
            
        });
            
        stackLayout0.style = "font-weight : normal; font-size: 18; padding-top: 0";
        //stackLayout0.padding = "10";
        scrollView0.content = stackLayout0;

        const tabViewItem0 = new tabViewModule.TabViewItem();
        if (i < tabs.length){
            tabViewItem0.title = prevStation = prevStation+to+tabs[i].to;
            prevStation = tabs[i].to;
        } else {
            tabViewItem0.title = prevStation = prevStation+to+end;
        }
        tabViewItem0.view = scrollView0;

        items.push(tabViewItem0);

    }
    return items;
}

function BrowseViewModel(context, thepage) {
    //SelectedPageService.getInstance().updateSelectedPage("Browse");
    viewModel.set("isBusy",false);

    //console.log(context.gara + " "+context.categoria);
    if(!context.gara || !context.categoria){
        Frame.goBack();
    }


    // pathsFromServer = JSON.parse(appSettings.getString("availablePaths","null"));
    // //console.log(pathsFromServer[context.gara].cats);

    // viewModel.set("titoloPercorso",pathsFromServer[context.gara].name + " | "+pathsFromServer[context.gara].cats[context.categoria].name);

    var noRunner = {}
    noRunner.name = "Ancora nessun corridore";
    var reqObj = {}
    reqObj.path = context.gara;
    reqObj.cat = context.categoria;
    //console.log(JSON.stringify(reqObj));
    fetch("https://wiro.scom-mendrisio.ch/API/getIntertimes.php", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(reqObj)
                }).then((r) => r.json())
                    .then((re) => {
                        //console.log(re);
                        const labelI = new labelModule.Label();
                        labelI.text = "Intertempi non disponibili.";
                        labelI.style = "font-size: 20; padding: 20;";
                        if(re.valid && !re.empty) {
                            if (re.tabs.length + 1 == re.payload.length) {
                                // OK
                                const tabView = new tabViewModule.TabView();

                                tabView.items = generateItems(re.tabs, re.payload);

                                tabView.selectedIndex = 0;

                                tabView.tabTextColor = "violet";
                                tabView.selectedTabTextColor = "DarkViolet";
                                tabView.androidSelectedTabHighlightColor = "DarkViolet";
                                tabView.className = "fas";

                                thepage.getViewById('tabspace').addChild(tabView);

                                viewModel.set("isBusy",false);
                            } else {
                                //ERROR

                                thepage.getViewById('tabspace').addChild(labelI);
                            }
                            viewModel.set("isBusy",false);
                        } else if (re.valid) {
                            thepage.getViewById('tabspace').addChild(labelI);
                            viewModel.set("isBusy",false);
                        } else {
                            // ERRORE
                            //console.log("invalidasdcasdc");
                            thepage.getViewById('tabspace').addChild(labelI);
                            viewModel.set("isBusy",false);
                        }
                    }).catch((e) => {
                        // ERRORE
                        //console.log(e);
                        thepage.getViewById('tabspace').addChild(labelI);
                        viewModel.set("isBusy",false);
                    });

    //viewModel.set("isBusy",false);
    

    // creating TabView
    

    // tabView.on(tabViewModule.TabView.selectedIndexChangedEvent, (args) => {
        
    // });

    //stack.addChild(tabs)
    //somePage.content = stack; // base example for adding the newly created Tabs to the current page



    return viewModel;
}

module.exports = BrowseViewModel;