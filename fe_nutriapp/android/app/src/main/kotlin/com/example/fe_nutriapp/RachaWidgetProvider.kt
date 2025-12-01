package com.example.fe_nutriapp

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import es.antonborri.home_widget.HomeWidgetPlugin

class RachaWidgetProvider : AppWidgetProvider() {
    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (appWidgetId in appWidgetIds) {
            val widgetData = HomeWidgetPlugin.getData(context)
            val racha = widgetData.getInt("racha", 0)
            val nombre = widgetData.getString("nombre", "Usuario")
            val rol = widgetData.getString("rol", "paciente")

            // Crear intent para abrir la app al tocar el widget
            val intent = Intent(context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            val pendingIntent = PendingIntent.getActivity(
                context,
                0,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            // Seleccionar layout según el rol
            val views = if (rol == "paciente") {
                // Layout para pacientes con racha
                RemoteViews(context.packageName, R.layout.racha_widget).apply {
                    setTextViewText(R.id.widget_racha, racha.toString())
                    setTextViewText(R.id.widget_nombre, nombre)
                    setTextViewText(R.id.widget_label, if (racha == 1) "día seguido" else "días seguidos")
                    setOnClickPendingIntent(R.id.widget_container, pendingIntent)
                }
            } else {
                // Layout para médicos/admins
                val rolTexto = when (rol) {
                    "medico" -> "Médico"
                    "admin" -> "Administrador"
                    else -> "Profesional"
                }
                RemoteViews(context.packageName, R.layout.medico_widget).apply {
                    setTextViewText(R.id.widget_nombre, nombre)
                    setTextViewText(R.id.widget_rol, rolTexto)
                    setOnClickPendingIntent(R.id.widget_container, pendingIntent)
                }
            }

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}
