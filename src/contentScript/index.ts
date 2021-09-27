import { githubMessageListener } from "../Messaging/GithubMessage";
import { renderApp } from "../InjectApp";

chrome.runtime.onMessage.addListener(githubMessageListener);

const container = document.createElement("div");
container.setAttribute("id", "hero-jira__container");

document.body.appendChild(container);

renderApp(container);

export {};
