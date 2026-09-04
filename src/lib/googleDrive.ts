import type { GoogleDriveConfig, GoogleDriveFileInput } from "@/types/domain/fileManager";

const GAPI_SRC = "https://apis.google.com/js/api.js";
const GIS_SRC = "https://accounts.google.com/gsi/client";

interface GapiPickerBuilder {
  addView: (view: unknown) => GapiPickerBuilder;
  setOAuthToken: (token: string) => GapiPickerBuilder;
  setDeveloperKey: (key: string) => GapiPickerBuilder;
  setCallback: (callback: (data: PickerResponse) => void) => GapiPickerBuilder;
  setTitle: (title: string) => GapiPickerBuilder;
  enableFeature: (feature: unknown) => GapiPickerBuilder;
  build: () => { setVisible: (visible: boolean) => void };
}

interface PickerDoc {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes?: string | number;
}

interface PickerResponse {
  action: string;
  docs?: PickerDoc[];
}

interface GapiNamespace {
  load: (name: string, callback: () => void) => void;
  picker: {
    api: {
      PickerBuilder: new () => GapiPickerBuilder;
      DocsView: new (viewId?: string) => {
        setIncludeFolders: (value: boolean) => unknown;
        setSelectFolderEnabled: (value: boolean) => unknown;
        setMimeTypes: (value: string) => unknown;
      };
      Action: { PICKED: string; CANCEL: string };
      Feature: { MULTISELECT_ENABLED: unknown };
      ViewId: { DOCS: string };
      Response: { ACTION: string; DOCUMENTS: string };
    };
  };
}

interface TokenResponse {
  access_token?: string;
  error?: string;
}

interface GoogleIdentityNamespace {
  accounts: {
    oauth2: {
      initTokenClient: (options: {
        client_id: string;
        scope: string;
        callback: (response: TokenResponse) => void;
        error_callback?: (error: { type?: string }) => void;
      }) => { requestAccessToken: (overrides?: { prompt?: string }) => void };
    };
  };
}

type WindowWithGoogle = Window & {
  gapi?: GapiNamespace;
  google?: GoogleIdentityNamespace;
};

const loadScript = (src: string): Promise<void> =>
  new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === "true") {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error(`Could not load ${src}`)));
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", () => {
      script.dataset.loaded = "true";
      resolve();
    });
    script.addEventListener("error", () => reject(new Error(`Could not load ${src}`)));
    document.head.appendChild(script);
  });

const loadPickerApi = async (): Promise<GapiNamespace> => {
  await loadScript(GAPI_SRC);
  const gapi = (window as WindowWithGoogle).gapi;
  if (!gapi) throw new Error("Google APIs did not load");

  await new Promise<void>((resolve) => gapi.load("picker", () => resolve()));

  return gapi;
};

export const requestDriveAccessToken = async (config: GoogleDriveConfig): Promise<string> => {
  await loadScript(GIS_SRC);
  const google = (window as WindowWithGoogle).google;
  if (!google) throw new Error("Google sign-in did not load");

  return new Promise<string>((resolve, reject) => {
    const client = google.accounts.oauth2.initTokenClient({
      client_id: config.clientId,
      scope: config.scope,
      callback: (response) => {
        if (response.access_token) {
          resolve(response.access_token);
          return;
        }
        reject(new Error(response.error || "Google did not grant access"));
      },
      error_callback: (error) => {
        reject(
          new Error(
            error?.type === "popup_closed"
              ? "The Google window was closed before access was granted"
              : "Google did not grant access"
          )
        );
      },
    });

    client.requestAccessToken({ prompt: "" });
  });
};

export const openDrivePicker = async (
  config: GoogleDriveConfig,
  accessToken: string,
  options: { multiple: boolean; mimeTypes?: string }
): Promise<GoogleDriveFileInput[]> => {
  const gapi = await loadPickerApi();
  const picker = gapi.picker.api;

  return new Promise<GoogleDriveFileInput[]>((resolve, reject) => {
    try {
      const view = new picker.DocsView(picker.ViewId.DOCS);
      view.setIncludeFolders(true);
      view.setSelectFolderEnabled(false);

      const exactMimeTypes = (options.mimeTypes ?? "")
        .split(",")
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0 && !entry.endsWith("/*"));

      if (exactMimeTypes.length > 0) view.setMimeTypes(exactMimeTypes.join(","));

      let builder = new picker.PickerBuilder()
        .addView(view)
        .setOAuthToken(accessToken)
        .setDeveloperKey(config.apiKey)
        .setTitle("Choose files from Google Drive")
        .setCallback((data) => {
          if (data.action === picker.Action.PICKED) {
            resolve(
              (data.docs ?? []).map((doc) => ({
                id: doc.id,
                name: doc.name,
                mimeType: doc.mimeType,
                sizeBytes: doc.sizeBytes === undefined ? undefined : Number(doc.sizeBytes),
              }))
            );
            return;
          }
          if (data.action === picker.Action.CANCEL) resolve([]);
        });

      if (options.multiple) builder = builder.enableFeature(picker.Feature.MULTISELECT_ENABLED);

      builder.build().setVisible(true);
    } catch (error) {
      reject(error instanceof Error ? error : new Error("Google Drive could not be opened"));
    }
  });
};
