import { githubMessageListener } from "../Messaging/GithubMessage";

chrome.runtime.onMessage.addListener(githubMessageListener);

export {};
