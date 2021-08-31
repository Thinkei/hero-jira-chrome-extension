import React from "react";
import { JiraConfig } from "../Storage";

export default React.createContext<JiraConfig>({
  host: "",
  token: "",
  email: "",
});
