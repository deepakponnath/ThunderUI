/**
 * Thunder application.js
 *
 * Main Thunder UI application - initializes and starts the UI
 * The landing page can be configured in conf.js (exposed through conf.js)
 */
'use strict';

import { WpeApi } from '../core/wpe.js';
import { conf } from '../conf.js';
import Menu from '../layout/menu.js';
import Footer from '../layout/footer.js';
import Notifications from '../layout/notifications.js';

// Plugins
import BluetoothControl from '../plugins/bluetooth.js';
import Compositor from '../plugins/compositor.js';
import Controller from '../plugins/controller.js';
import DeviceInfo from '../plugins/deviceinfo.js';
import DialServer from '../plugins/dialserver.js';
import LocationSync from '../plugins/locationsync.js';
import Monitor from '../plugins/monitor.js';
import Netflix from '../plugins/netflix.js';
import NetworkControl from '../plugins/networkcontrol.js';
import OCDM from '../plugins/ocdm.js';
import Power from '../plugins/power.js';
import Provisioning from '../plugins/provisioning.js';
import RemoteControl from '../plugins/remotecontrol.js';
import Snapshot from '../plugins/snapshot.js';
import Spark from '../plugins/spark.js';
import Switchboard from '../plugins/switchboard.js';
import TimeSync from '../plugins/timesync.js';
import TraceControl from '../plugins/tracing.js';
import WebKitBrowser from '../plugins/webkit.js';
import WebShell from '../plugins/webshell.js';
import WifiControl from '../plugins/wificontrol.js';

/**
* Create the initial structure & globals
*/

// public
var plugins             = {};        // wfui plugins
var api                 = undefined; // WPE API
var plugin              = undefined;
//var conf                = Conf.default;

// private
var fetchedPlugins  = [];
var mainDiv         = document.getElementById('main');
var activePlugin    = window.localStorage.getItem('lastActivePlugin') || undefined;

/**
* Main initialization function
*
* Goes through a series of bootSteps to initialize the application, each step calls init again
* Within the init a loadingPage is rendered to show progress of the boot
* @memberof application
*/
function init(host){
    // initialize the WPE Framework API
    api = new WpeApi(host);
    console.debug('Getting list of plugins from Framework');
    api.getControllerPlugins().then( data => {
        fetchedPlugins = data;
        return fetchedPlugins
    }).then( fetchedPlugins => {
        console.debug('Loading plugins');

        /*
        let loadedPluginClassNames = pluginClasses.filter( pluginClass => {
            if (pluginClass.name !== undefined)
                return true
            else
                return false
        }).map( pluginClass => {
            return pluginClass.name();
        })*/

        // check which plugins are present on the device
        for (var i=0; i<fetchedPlugins.length; i++) {
            var pluginName = fetchedPlugins[i].callsign;
            var pluginClass = fetchedPlugins[i].classname;

            plugins[ pluginName ] = new window[pluginClass](fetchedPlugins[i], api);


            // try to init the plugin
            /*
            if (loadedPluginClassNames.indexOf(pluginClass) != -1) {
                console.debug('Initializing plugin ' + pluginName);
                plugins[ pluginName ] = new pluginClasses[ loadedPluginClassNames.indexOf(pluginClass) ].class(fetchedPlugins[i], api);
            

            } else {
                console.debug('Unsupported plugin: ' + pluginName);
            }
            */
        }

        plugins.footer = new Footer(plugins.DeviceInfo);
        plugins.menu = new Menu(plugins, api);
        plugins.menu.render(activePlugin !== undefined ? activePlugin : conf.startPlugin);
        plugins.notifications = new Notifications(api);

    })

    showPlugin(activePlugin !== undefined ? activePlugin : conf.startPlugin);

}

/** (global) renders a plugin in the main div */
function showPlugin(callsign) {
    if (plugins[ callsign ] === undefined)
        return;

    if (activePlugin !== undefined && plugins[ activePlugin ] !== undefined)
        plugins[ activePlugin ].close();

    document.getElementById('main').innerHTML = '';
    plugins[ callsign ].render();
    activePlugin = callsign;
    window.localStorage.setItem('lastActivePlugin', callsign);
};

/** (global) refresh current active plugin */
function renderCurrentPlugin() {
    // lets re-render menu too, just to be sure
    plugins.menu.render(activePlugin);

    document.getElementById('main').innerHTML = '';
    plugins[ activePlugin ].render();
};

export { init, showPlugin, conf, renderCurrentPlugin };