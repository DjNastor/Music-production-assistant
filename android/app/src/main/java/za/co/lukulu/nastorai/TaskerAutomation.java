package za.co.lukulu.nastorai;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.widget.Toast;

/** Local, user-confirmed Tasker invocations; never exposed to WebView JavaScript. */
final class TaskerAutomation {
    private static final String PACKAGE = "net.dinglisch.android.taskerm";
    private static final String PERMISSION = "net.dinglisch.android.tasker.PERMISSION_RUN_TASKS";
    private static final String ACTION = "net.dinglisch.android.tasker.ACTION_TASK";
    private static final int REQUEST_PERMISSION = 513;
    private static final String[] LABELS = {
        "Test connection", "Start production session", "Review unfinished songs", "Release checklist"
    };
    private static final String[] TASKS = {
        "Nastor Test", "Nastor Studio Session", "Nastor Project Review", "Nastor Release Checklist"
    };
    private static final String[] RECIPES = {
        "Add a Flash action with text: Nastor Tasker connection works.",
        "Add a Flash action: Production session started. Optional: add Launch App for your preferred music app.",
        "Add a Notify action titled Project review, with text: Open Project Finisher and review the next outstanding task.",
        "Add a Notify action titled Release checklist, with text: Review master, credits, artwork and metadata before release."
    };

    private TaskerAutomation() {}

    static void show(Activity host) {
        new AlertDialog.Builder(host)
            .setTitle("Automation Centre · Tasker")
            .setItems(LABELS, (dialog, index) -> showRecipe(host, index))
            .setNegativeButton("Close", null)
            .show();
    }

    private static void showRecipe(Activity host, int index) {
        if (index < 0 || index >= TASKS.length) return;
        String recipe = "Task name: " + TASKS[index] + "\n\n"
            + "In Tasker, create a task with this exact name. " + RECIPES[index]
            + "\n\nEnable Tasker > Preferences > Misc > Allow External Access. "
            + "Grant Nastor the Run Tasks permission when asked. "
            + "Review the task in Tasker before running it. This recipe is a manual setup guide, not an imported Tasker file.";
        new AlertDialog.Builder(host)
            .setTitle(LABELS[index])
            .setMessage(recipe)
            .setNeutralButton("Copy recipe", (dialog, which) -> {
                ClipboardManager clipboard = (ClipboardManager) host.getSystemService(Context.CLIPBOARD_SERVICE);
                if (clipboard != null) {
                    clipboard.setPrimaryClip(ClipData.newPlainText("Nastor Tasker recipe", recipe));
                    toast(host, "Recipe copied");
                }
            })
            .setNegativeButton("Cancel", null)
            .setPositiveButton("Run existing task", (dialog, which) -> confirm(host, index))
            .show();
    }

    private static void confirm(Activity host, int index) {
        new AlertDialog.Builder(host)
            .setTitle("Run " + TASKS[index] + "?")
            .setMessage("Only run this after checking its actions in Tasker. Nastor cannot inspect or verify the task's actual contents or result.")
            .setNegativeButton("Cancel", null)
            .setPositiveButton("Run", (dialog, which) -> run(host, index))
            .show();
    }

    private static void run(Activity host, int index) {
        if (index < 0 || index >= TASKS.length) return;
        try {
            host.getPackageManager().getPackageInfo(PACKAGE, 0);
        } catch (PackageManager.NameNotFoundException missing) {
            toast(host, "Install or enable Tasker first.");
            return;
        }
        if (host.checkSelfPermission(PERMISSION) != PackageManager.PERMISSION_GRANTED) {
            host.requestPermissions(new String[]{PERMISSION}, REQUEST_PERMISSION);
            toast(host, "Grant permission, then select the task and confirm again.");
            return;
        }
        Intent request = new Intent(ACTION).setPackage(PACKAGE);
        request.putExtra("task_name", TASKS[index]);
        try {
            host.sendBroadcast(request);
            toast(host, "Request sent. Check Tasker Run Log to verify execution.");
        } catch (SecurityException denied) {
            toast(host, "Tasker denied access. Check permission and external access.");
        }
    }

    private static void toast(Activity host, String message) {
        Toast.makeText(host, message, Toast.LENGTH_LONG).show();
    }
}
