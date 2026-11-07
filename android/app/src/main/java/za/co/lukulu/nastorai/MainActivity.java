package za.co.lukulu.nastorai;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.CookieManager;
import android.webkit.PermissionRequest;
import android.webkit.SslErrorHandler;
import android.net.http.SslError;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

/**
 * Android beta: secure browser shell for the hosted Nastor AI Studio.
 * No privileged JavaScript bridge and no audio-provider secrets are bundled.
 */
public final class MainActivity extends Activity {
    private static final String STUDIO_URL = "https://nastor-ai-studio.vercel.app/";
    private static final String STUDIO_HOST = "nastor-ai-studio.vercel.app";
    private static final int PICK_FILE_REQUEST = 512;

    private WebView studio;
    private ValueCallback<Uri[]> pendingFileUpload;

    @Override
    public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().setStatusBarColor(Color.rgb(13, 14, 16));
        getWindow().setNavigationBarColor(Color.rgb(13, 14, 16));

        studio = new WebView(this);
        studio.setBackgroundColor(Color.rgb(13, 14, 16));
        setContentView(studio);
        WebView.setWebContentsDebuggingEnabled(false);

        WebSettings settings = studio.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(true); // Required for explicit file picker selection.
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setSupportMultipleWindows(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setSafeBrowsingEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(studio, false);

        studio.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if (trusted(uri)) return false;
                openExternalHttps(uri);
                return true;
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (!request.isForMainFrame()) return;
                String offlineHtml = "<!doctype html><html><head><meta name='viewport' "
                    + "content='width=device-width,initial-scale=1'></head>"
                    + "<body style='background:#0d0e10;color:#eee8dd;font:16px system-ui;"
                    + "text-align:center;padding:48px 20px'><h1>Studio connection unavailable</h1>"
                    + "<p>Check your internet connection. Your browser-local projects have not been deleted.</p>"
                    + "<a style='color:#e8bc74' href='" + STUDIO_URL + "'>Retry studio</a></body></html>";
                view.loadDataWithBaseURL(STUDIO_URL, offlineHtml, "text/html", "UTF-8", null);
            }

            @Override
            public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
                handler.cancel();
                Toast.makeText(MainActivity.this, "Secure connection failed", Toast.LENGTH_LONG).show();
            }
        });

        studio.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback,
                                             FileChooserParams params) {
                if (pendingFileUpload != null) pendingFileUpload.onReceiveValue(null);
                pendingFileUpload = callback;
                try {
                    startActivityForResult(params.createIntent(), PICK_FILE_REQUEST);
                    return true;
                } catch (ActivityNotFoundException failure) {
                    pendingFileUpload = null;
                    callback.onReceiveValue(null);
                    Toast.makeText(MainActivity.this, "No file picker installed", Toast.LENGTH_LONG).show();
                    return false;
                }
            }

            @Override
            public void onPermissionRequest(PermissionRequest request) {
                // Future microphone/camera use requires explicit security review.
                request.deny();
            }
        });

        // Signed provider downloads open in the device browser; no arbitrary file-system access.
        studio.setDownloadListener((url, userAgent, contentDisposition, mimeType, length) ->
            openExternalHttps(Uri.parse(url)));

        if (state == null || studio.restoreState(state) == null) studio.loadUrl(STUDIO_URL);
    }

    private boolean trusted(Uri uri) {
        return "https".equalsIgnoreCase(uri.getScheme())
            && STUDIO_HOST.equalsIgnoreCase(uri.getHost())
            && (uri.getPort() == -1 || uri.getPort() == 443);
    }

    private void openExternalHttps(Uri uri) {
        if (!"https".equalsIgnoreCase(uri.getScheme()) || uri.getHost() == null) return;
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, uri));
        } catch (ActivityNotFoundException ignored) {
            Toast.makeText(this, "No browser is available", Toast.LENGTH_SHORT).show();
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent intent) {
        super.onActivityResult(requestCode, resultCode, intent);
        if (requestCode != PICK_FILE_REQUEST || pendingFileUpload == null) return;
        ValueCallback<Uri[]> callback = pendingFileUpload;
        pendingFileUpload = null;
        callback.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(resultCode, intent));
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        studio.saveState(outState);
        super.onSaveInstanceState(outState);
    }

    @Override
    public void onBackPressed() {
        if (studio != null && studio.canGoBack()) studio.goBack();
        else super.onBackPressed();
    }

    @Override
    protected void onDestroy() {
        if (pendingFileUpload != null) {
            pendingFileUpload.onReceiveValue(null);
            pendingFileUpload = null;
        }
        if (studio != null) {
            studio.destroy();
            studio = null;
        }
        super.onDestroy();
    }
}
