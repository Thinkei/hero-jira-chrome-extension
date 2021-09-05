import React from "react";
import { JiraConfig } from "../Storage";

export const initialJiraConfig: JiraConfig = {
  host: "",
  token: "",
  email: "",
};

export default React.createContext<JiraConfig>(initialJiraConfig);
