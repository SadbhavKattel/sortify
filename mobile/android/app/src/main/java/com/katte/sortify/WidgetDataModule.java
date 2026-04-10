package com.katte.sortify;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class WidgetDataModule extends ReactContextBaseJavaModule {
    private final ReactApplicationContext reactContext;

    public WidgetDataModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "WidgetData";
    }

    @ReactMethod
    public void setWidgetData(String dataJson) {
        SharedPreferences prefs = reactContext.getSharedPreferences("SortifyWidgetPrefs", Context.MODE_PRIVATE);
        prefs.edit().putString("widget_data", dataJson).apply();

        // Broadcast to update large widget
        Intent intentLarge = new Intent(reactContext, SortifyWidgetProvider.class);
        intentLarge.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
        int[] idsLarge = AppWidgetManager.getInstance(reactContext).getAppWidgetIds(new ComponentName(reactContext, SortifyWidgetProvider.class));
        intentLarge.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, idsLarge);
        reactContext.sendBroadcast(intentLarge);

        // Broadcast to update small widget
        Intent intentSmall = new Intent(reactContext, SortifySmallWidgetProvider.class);
        intentSmall.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
        int[] idsSmall = AppWidgetManager.getInstance(reactContext).getAppWidgetIds(new ComponentName(reactContext, SortifySmallWidgetProvider.class));
        intentSmall.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, idsSmall);
        reactContext.sendBroadcast(intentSmall);
    }
}
