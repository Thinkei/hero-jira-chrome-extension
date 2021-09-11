import React from "react";
import { Tabs, Tag } from "hero-design";
import { useTheme } from "styled-components";
import axios from "axios";
import TextLoop from "react-text-loop";

import logo from "./assets/logo_with_name.png";
import Configuration from "./Configuration";
import Sync from "./Sync";
import Storage, {
  JiraConfig,
  GithubConfig,
  AuthConfiguration,
} from "./Storage";
import JiraConfigContext, {
  initialJiraConfig,
} from "./context/JiraConfigContext";
import GithubConfigContext, {
  initialGithubConfig,
} from "./context/GithubConfigContext";

const isValidConfig = (conf: JiraConfig | GithubConfig) =>
  Object.values(conf).every((value) => !!value);

function App() {
  const [selectedTabId, setSelectedTabId] = React.useState<string | number>(1);

  const [jiraConfig, setJiraConfig] =
    React.useState<JiraConfig>(initialJiraConfig);
  const [githubConfig, setGithubConfig] =
    React.useState<GithubConfig>(initialGithubConfig);

  const validAuthConfig =
    isValidConfig(jiraConfig) && isValidConfig(githubConfig);

  const onSaveConfig = React.useCallback((conf: AuthConfiguration) => {
    setJiraConfig(conf.jiraConfig);
    setGithubConfig(conf.githubConfig);
  }, []);

  React.useEffect(() => {
    Storage.get().then((config) => {
      if (config == null) return;
      setJiraConfig(config.jiraConfig);
      setGithubConfig(config.githubConfig);
    });
  }, []);

  const theme = useTheme();

  React.useEffect(() => {
    if (isValidConfig(jiraConfig)) {
      const { host, email, token } = jiraConfig;
      axios.defaults.baseURL = host;
      axios.interceptors.request.use(
        (requestConfig) => {
          requestConfig.headers = {
            Authorization: `Basic ${Buffer.from(`${email}:${token}`).toString(
              "base64"
            )}`,
          };
          return requestConfig;
        },
        (error) => Promise.reject(error)
      );
    }
  }, [jiraConfig]);

  return (
    <div style={{ textAlign: "center", minWidth: 350 }}>
      <header>
        <div style={{ position: "relative" }}>
          <img src={logo} alt="logo" style={{ height: 150 }} />
          {process.env.NODE_ENV === "development" && (
            <Tag
              text={
                <TextLoop
                  springConfig={{ stiffness: 180, damping: 8 }}
                  interval={3000}
                >
                  {["DEV BUILD", "STAY SAFE"]}
                </TextLoop>
              }
              intent="danger"
              variant="filled"
              style={{
                position: "absolute",
                right: theme.space.medium,
                top: theme.space.medium,
              }}
            />
          )}
        </div>
      </header>
      <div style={{ textAlign: "left" }}>
        <JiraConfigContext.Provider value={jiraConfig}>
          <GithubConfigContext.Provider value={githubConfig}>
            <Tabs
              id="config-tabs-2"
              style={{
                marginLeft: theme.space.small,
                marginRight: theme.space.small,
                marginBottom: theme.space.small,
              }}
              tabs={[
                {
                  id: 1,
                  title: "Sync",
                  disabled: !validAuthConfig,
                  panel: <Sync />,
                  icon: "sync",
                },
                {
                  id: 2,
                  title: "Configuration",
                  panel: <Configuration onSaveConfig={onSaveConfig} />,
                  icon: "adjustment",
                },
              ]}
              selectedTabId={validAuthConfig ? selectedTabId : 2}
              onChange={(newTabId) => setSelectedTabId(newTabId)}
            />
          </GithubConfigContext.Provider>
        </JiraConfigContext.Provider>
      </div>
    </div>
  );
}

export default App;
