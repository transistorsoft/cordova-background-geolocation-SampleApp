package com.transistorsoft.cordova.bggeo;

import android.app.ActivityManager;
import android.content.Context;
import android.os.Bundle;

import org.json.JSONObject;

import com.transistorsoft.locationmanager.adapter.BackgroundGeolocation;
import com.transistorsoft.locationmanager.logger.TSLog;

import java.util.List;

/**
 * BackgroundGeolocationHeadlessTask
 * This component allows you to receive events from the BackgroundGeolocation plugin in the native Android environment while your app has been *terminated*,
 * where the plugin is configured for stopOnTerminate: false.  In this context, only the plugin's service is running.  This component will receive all the same
 * events you'd listen to in the Javascript API.
 *
 * You might use this component to:
 * - fetch / post information to your server (eg: request new API key)
 * - execute BackgroundGeolocation API methods (eg: #getCurrentPosition, #setConfig, #addGeofence, #stop, etc -- you can execute ANY method of the Javascript API)
 */

public class BackgroundGeolocationHeadlessTask extends HeadlessTask implements HeadlessTask.Receiver {

    @Override
    public void onReceive(Context context, String event, JSONObject params) {
        TSLog.logger.debug("BackgroundGeolocationHeadlessTask: " + event);
        BackgroundGeolocation bgGeo = BackgroundGeolocation.getInstance(context);
        finish();
    }
}