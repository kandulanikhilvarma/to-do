// Quick Settings tile and home-screen widget that start the SOS countdown
// (spec S1a). Both open todu:///?trigger=<source>; the SOS screen starts the
// countdown, never the alert itself, so a pocket tap can still be cancelled.
//
// The tile unlocks the phone first (TileService.unlockAndRun). Launching over
// the lock screen would also expose the medical profile and circle to anyone
// holding the phone; the phone's built-in Emergency SOS covers the locked case.
//
// Kept as a plugin because android/ is generated, never edited by hand.

const fs = require("node:fs");
const path = require("node:path");
const { withAndroidManifest, withDangerousMod } = require("expo/config-plugins");

const STRINGS = {
  values: {
    todu_tile_label: "Todu SOS",
    todu_widget_title: "SOS",
    todu_widget_hint: "Tap to start the countdown",
    todu_widget_a11y: "Todu SOS. Opens Todu and starts the SOS countdown.",
  },
  "values-te": {
    todu_tile_label: "Todu SOS",
    todu_widget_title: "SOS",
    todu_widget_hint: "కౌంట్‌డౌన్ ప్రారంభించడానికి నొక్కండి",
    todu_widget_a11y: "Todu SOS. Todu తెరిచి SOS కౌంట్‌డౌన్ ప్రారంభిస్తుంది.",
  },
  "values-hi": {
    todu_tile_label: "Todu SOS",
    todu_widget_title: "SOS",
    todu_widget_hint: "काउंटडाउन शुरू करने के लिए टैप करें",
    todu_widget_a11y: "Todu SOS. Todu खोलकर SOS काउंटडाउन शुरू करता है।",
  },
};

const kotlin = (pkg) => ({
  "SosLaunch.kt": `package ${pkg}

import android.content.Context
import android.content.Intent
import android.net.Uri

/** The deep link the SOS screen turns into a countdown. */
object SosLaunch {
  fun intent(context: Context, source: String): Intent =
    Intent(Intent.ACTION_VIEW, Uri.parse("todu:///?trigger=$source"))
      .setPackage(context.packageName)
      .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
}
`,
  "SosTileService.kt": `package ${pkg}

import android.app.PendingIntent
import android.os.Build
import android.service.quicksettings.Tile
import android.service.quicksettings.TileService

/** Quick Settings tile: opens Todu and starts the SOS countdown. */
class SosTileService : TileService() {
  override fun onStartListening() {
    qsTile?.apply {
      state = Tile.STATE_INACTIVE
      updateTile()
    }
  }

  override fun onClick() {
    if (isLocked) unlockAndRun { launch() } else launch()
  }

  private fun launch() {
    val intent = SosLaunch.intent(this, "tile")
    if (Build.VERSION.SDK_INT >= 34) {
      val flags = PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
      startActivityAndCollapse(PendingIntent.getActivity(this, 0, intent, flags))
    } else {
      @Suppress("DEPRECATION")
      startActivityAndCollapse(intent)
    }
  }
}
`,
  "SosWidgetProvider.kt": `package ${pkg}

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.widget.RemoteViews

/** Home-screen widget: one large target that starts the SOS countdown. */
class SosWidgetProvider : AppWidgetProvider() {
  override fun onUpdate(context: Context, manager: AppWidgetManager, ids: IntArray) {
    val flags = PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
    val tap = PendingIntent.getActivity(context, 1, SosLaunch.intent(context, "widget"), flags)
    for (id in ids) {
      val views = RemoteViews(context.packageName, R.layout.todu_widget)
      views.setOnClickPendingIntent(R.id.todu_widget_root, tap)
      manager.updateAppWidget(id, views)
    }
  }
}
`,
});

const RES = {
  "layout/todu_widget.xml": `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/todu_widget_root"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="@drawable/todu_widget_bg"
    android:contentDescription="@string/todu_widget_a11y"
    android:gravity="center"
    android:orientation="vertical"
    android:padding="8dp">
    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="@string/todu_widget_title"
        android:textColor="#FFFFFF"
        android:textSize="30sp"
        android:textStyle="bold" />
    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_marginTop="4dp"
        android:gravity="center"
        android:text="@string/todu_widget_hint"
        android:textColor="#E5E7EB"
        android:textSize="12sp" />
</LinearLayout>
`,
  "drawable/todu_widget_bg.xml": `<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android" android:shape="rectangle">
    <solid android:color="#2A1215" />
    <stroke android:width="3dp" android:color="#EF4444" />
    <corners android:radius="28dp" />
</shape>
`,
  "drawable/ic_todu_tile.xml": `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp" android:height="24dp" android:viewportWidth="24" android:viewportHeight="24">
    <path android:fillColor="#FFFFFFFF"
        android:pathData="M12,2 L20,5 V11 C20,16 16.6,20.4 12,22 C7.4,20.4 4,16 4,11 V5 Z M11,7 V13 H13 V7 Z M11,15 V17 H13 V15 Z" />
</vector>
`,
  "xml/todu_widget_info.xml": `<?xml version="1.0" encoding="utf-8"?>
<appwidget-provider xmlns:android="http://schemas.android.com/apk/res/android"
    android:description="@string/todu_widget_hint"
    android:initialLayout="@layout/todu_widget"
    android:minHeight="110dp"
    android:minWidth="110dp"
    android:previewLayout="@layout/todu_widget"
    android:resizeMode="horizontal|vertical"
    android:targetCellHeight="2"
    android:targetCellWidth="2"
    android:updatePeriodMillis="0"
    android:widgetCategory="home_screen" />
`,
};

const escape = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/'/g, "\\'");

function withShortcutFiles(config) {
  return withDangerousMod(config, [
    "android",
    async (mod) => {
      const pkg = mod.android.package;
      const main = path.join(mod.modRequest.platformProjectRoot, "app", "src", "main");
      const javaDir = path.join(main, "java", ...pkg.split("."));
      fs.mkdirSync(javaDir, { recursive: true });
      for (const [name, body] of Object.entries(kotlin(pkg))) {
        fs.writeFileSync(path.join(javaDir, name), body);
      }
      for (const [rel, body] of Object.entries(RES)) {
        const file = path.join(main, "res", rel);
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, body);
      }
      for (const [dir, strings] of Object.entries(STRINGS)) {
        const rows = Object.entries(strings)
          .map(([k, v]) => `    <string name="${k}">${escape(v)}</string>`)
          .join("\n");
        const file = path.join(main, "res", dir, "todu_shortcuts.xml");
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n${rows}\n</resources>\n`);
      }
      return mod;
    },
  ]);
}

function withShortcutManifest(config) {
  return withAndroidManifest(config, (mod) => {
    const app = mod.modResults.manifest.application[0];
    app.service = (app.service ?? []).filter((s) => s.$["android:name"] !== ".SosTileService");
    app.service.push({
      $: {
        "android:name": ".SosTileService",
        "android:exported": "true",
        "android:icon": "@drawable/ic_todu_tile",
        "android:label": "@string/todu_tile_label",
        "android:permission": "android.permission.BIND_QUICK_SETTINGS_TILE",
      },
      "intent-filter": [
        { action: [{ $: { "android:name": "android.service.quicksettings.action.QS_TILE" } }] },
      ],
    });
    app.receiver = (app.receiver ?? []).filter((r) => r.$["android:name"] !== ".SosWidgetProvider");
    app.receiver.push({
      $: { "android:name": ".SosWidgetProvider", "android:exported": "false" },
      "intent-filter": [
        { action: [{ $: { "android:name": "android.appwidget.action.APPWIDGET_UPDATE" } }] },
      ],
      "meta-data": [
        {
          $: {
            "android:name": "android.appwidget.provider",
            "android:resource": "@xml/todu_widget_info",
          },
        },
      ],
    });
    return mod;
  });
}

module.exports = function withSosShortcuts(config) {
  return withShortcutManifest(withShortcutFiles(config));
};
