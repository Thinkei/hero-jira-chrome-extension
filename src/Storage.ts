export interface JiraConfig {
  host?: string;
  token?: string;
  email?: string;
}

const KEY = "jiraConfig";

const set = (jiraConfig: JiraConfig, onDone?: () => void) => {
  chrome.storage.local.set({ [KEY]: JSON.stringify(jiraConfig) }, onDone);
};

const get = () => {
  return new Promise<JiraConfig>((resolve) => {
    chrome.storage.local.get(KEY, (json) => {
      const config = JSON.parse(json[KEY]);
      const host = config.host as string | undefined;
      const token = config.token as string | undefined;
      const email = config.email as string | undefined;

      resolve({
        host,
        token,
        email,
      });
    });
  });
};

const Storage = {
  get,
  set,
};

export default Storage;
