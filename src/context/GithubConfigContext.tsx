import React from "react";
import { GithubConfig } from "../Storage";

export const initialGithubConfig: GithubConfig = { token: "" };

export default React.createContext<GithubConfig>(initialGithubConfig);
