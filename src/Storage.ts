export interface JiraConfig {
  host: string;
  token: string;
  email: string;
}

const KEY = "jiraConfig";

const set = (jiraConfig: JiraConfig, onDone?: () => void) => {
  chrome.storage.local.set({ [KEY]: JSON.stringify(jiraConfig) }, onDone);
};

const get = () => {
  return new Promise<JiraConfig | undefined>((resolve) => {
    chrome.storage.local.get(KEY, (json) => {
      if (json[KEY] !== undefined) {
        const config = JSON.parse(json[KEY]) as JiraConfig | undefined;
        resolve(config);
      }
      resolve(undefined);
    });
  });
};

const Storage = {
  get,
  set,
};

export default Storage;
