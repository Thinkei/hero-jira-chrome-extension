const githubStatuses = ["Draft", "Open", "Merged", "Closed"] as const;
export type GithubStatus = typeof githubStatuses[number];

const isGithubStatus = (value: string): value is GithubStatus =>
  githubStatuses.includes(value as GithubStatus);

export interface GithubIssueResponse {
  readonly __tag: "IssueResponse" | "PullResponse";
  organisation: string;
  project: string;
  id: string;
  title: string;
  status?: GithubStatus;
  jiraKey?: string;
}

export interface ErrorResponse {
  readonly __tag: "ErrorResponse";
  errorMessage: string;
}

export type Response = GithubIssueResponse | ErrorResponse;

const GithubMessage = "GithubMessage";

const sendGithubMessage = (onResponse: (response: Response) => void) => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const tab0 = tabs[0];
    if (tab0 !== undefined && tab0.id != null) {
      chrome.tabs.sendMessage(tab0.id, GithubMessage, onResponse);
    }
  });
};

const githubIssueRegex =
  /https:\/\/*.github.com\/([\w'.-]+)\/([\w'.-]+)\/(?:pull|issues)\/(\d*)/;
const jiraKeyRegex = /\[\w*-\d*\]/;

const generateResponse: (
  tag: GithubIssueResponse["__tag"],
  matches: RegExpMatchArray
) => Response = (tag, matches) => {
  const title = document.querySelector(".js-issue-title")?.textContent;
  const status = document
    .querySelector(".State[title*='Status']")
    ?.textContent?.trim();

  if (title == null)
    return {
      __tag: "ErrorResponse",
      errorMessage: "PR/Issue title not found",
    } as ErrorResponse;

  const matchJiraKey = title.match(jiraKeyRegex);

  return {
    __tag: tag,
    organisation: matches[1],
    project: matches[2],
    id: matches[3],
    status: status && isGithubStatus(status) ? status : undefined,
    jiraKey: matchJiraKey ? matchJiraKey[0].replace(/[\[\]]/g, "") : undefined,
    title,
  };
};

const githubMessageListener = (
  msg: string,
  sender: unknown,
  sendResponse: (response: Response) => void
) => {
  if (msg === GithubMessage) {
    const path = window.location.href;
    const issueMatches = path.match(githubIssueRegex);

    if (issueMatches !== null) {
      if (issueMatches[0].includes("/issues/")) {
        sendResponse(generateResponse("IssueResponse", issueMatches));
        return;
      }
      if (issueMatches[0].includes("/pull/")) {
        sendResponse(generateResponse("PullResponse", issueMatches));
        return;
      }
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
};

export { sendGithubMessage, githubMessageListener };
