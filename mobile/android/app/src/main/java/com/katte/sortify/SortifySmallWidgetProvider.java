package com.katte.sortify;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.SharedPreferences;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONObject;

public class SortifySmallWidgetProvider extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_small_light);

        String currentDate = new java.text.SimpleDateFormat("EEE, MMM d", java.util.Locale.getDefault()).format(new java.util.Date());
        views.setTextViewText(R.id.widget_date, currentDate);

        SharedPreferences prefs = context.getSharedPreferences("SortifyWidgetPrefs", Context.MODE_PRIVATE);
        String dataJson = prefs.getString("widget_data", "[]");

        try {
            JSONArray emails = new JSONArray(dataJson);

            int[] headerIds = {R.id.email1_header, R.id.email2_header, R.id.email3_header};
            int[] pillIds = {R.id.email1_pill, R.id.email2_pill, R.id.email3_pill};
            int[] subjIds = {R.id.email1_subject, R.id.email2_subject, R.id.email3_subject};
            int[] rowContainerIds = {R.id.row1_container, R.id.row2_container, R.id.row3_container};

            for (int i = 0; i < 3; i++) {
                if (i < emails.length()) {
                    JSONObject email = emails.getJSONObject(i);
                    String header = email.optString("senderName", "Unknown") + " · " + email.optString("urgencyReasons", "Important");
                    String pill = email.optString("priorityLevel", "Med");
                    String subject = email.optString("subject", "No subject");

                    views.setTextViewText(headerIds[i], header);
                    views.setTextViewText(pillIds[i], pill);
                    views.setTextViewText(subjIds[i], subject);
                    views.setViewVisibility(rowContainerIds[i], android.view.View.VISIBLE);
                } else {
                    views.setViewVisibility(rowContainerIds[i], android.view.View.GONE);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        android.content.Intent intent = new android.content.Intent(context, MainActivity.class);
        android.app.PendingIntent pendingIntent = android.app.PendingIntent.getActivity(context, 0, intent, android.app.PendingIntent.FLAG_UPDATE_CURRENT | android.app.PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_root, pendingIntent);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }
}
