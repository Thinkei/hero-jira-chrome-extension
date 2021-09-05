export interface JiraConfig {
  host: string;
  email: string;
  token: string;
}

export interface GithubConfig {
  token: string;
}

const CONFIG_KEY = "heroJiraConfig";
const JIRA_KEY = "jiraConfig";
const GITHUB_KEY = "githubConfig";

export interface AuthConfiguration {
  [JIRA_KEY]: JiraConfig;
  [GITHUB_KEY]: GithubConfig;
}

const set = (
  { jiraConfig, githubConfig }: AuthConfiguration,
  onDone?: () => void
) => {
  chrome.storage.local.set(
    {
      [CONFIG_KEY]: {
        [JIRA_KEY]: JSON.stringify(jiraConfig),
        [GITHUB_KEY]: JSON.stringify(githubConfig),
      },
    },
    onDone
  );
};

const get = () => {
  return new Promise<AuthConfiguration | undefined>((resolve) => {
    chrome.storage.local.get(CONFIG_KEY, (json) => {
      const configs = json[CONFIG_KEY];
      if (configs !== undefined) {
        resolve({
          [JIRA_KEY]: JSON.parse(configs[JIRA_KEY]),
          [GITHUB_KEY]: JSON.parse(configs[GITHUB_KEY]),
        });
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
