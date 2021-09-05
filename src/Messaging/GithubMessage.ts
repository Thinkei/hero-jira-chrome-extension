export interface PullResponse {
  readonly __tag: "PullResponse";
  organisation: string;
  project: string;
  pullId: string;
  title: string;
  jiraKey?: string;
}

export interface IssueResponse {
  readonly __tag: "IssueResponse";
  title: string;
  body: string;
}

export interface ErrorResponse {
  readonly __tag: "ErrorResponse";
  errorMessage: string;
}

export type Response = PullResponse | IssueResponse | ErrorResponse;

const GithubMessage = "GithubMessage";

const sendGithubMessage = (onResponse: (response: Response) => void) => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const tab0 = tabs[0];
    if (tab0 !== undefined && tab0.id != null) {
      chrome.tabs.sendMessage(tab0.id, GithubMessage, onResponse);
    }
  });
};

const githubPullRegex =
  /https:\/\/*.github.com\/([\w'-]+)\/([\w'-]+)\/pull\/(\d*)/;
const jiraKeyRegex = /\[\w*-\d*\]/;

const githubMessageListener = (
  msg: string,
  sender: unknown,
  sendResponse: (response: Response) => void
) => {
  if (msg === GithubMessage) {
    const path = window.location.href;
    const matchGithubPull = path.match(githubPullRegex);
    if (matchGithubPull !== null) {
      const organisation = matchGithubPull[1];
      const project = matchGithubPull[2];
      const pullId = matchGithubPull[3];

      const pullTitle = document.querySelector(".js-issue-title")?.textContent;

      if (pullTitle !== undefined && pullTitle !== null) {
        const matchJiraKey = pullTitle.match(jiraKeyRegex);
        if (matchJiraKey !== null && matchJiraKey !== undefined) {
          const jiraKey = matchJiraKey[0];
          sendResponse({
            __tag: "PullResponse",
            organisation,
            project,
            pullId,
            title: pullTitle,
            jiraKey: jiraKey.replace("[", "").replace("]", ""),
          });
          return;
        } else {
          sendResponse({
            __tag: "PullResponse",
            organisation,
            project,
            title: pullTitle,
            pullId,
          });
          return;
        }
      }
      sendResponse({
        __tag: "ErrorResponse",
        errorMessage: "Pull title not found",
      });
      return;
    }

    sendResponse({
      __tag: "ErrorResponse",
      errorMessage: "Not a github pull nor issue",
    });
    return;
  }
  sendResponse({
    __tag: "ErrorResponse",
    errorMessage: `Unhandle message ${msg}`,
  });
  return;
};

export { sendGithubMessage, githubMessageListener };
