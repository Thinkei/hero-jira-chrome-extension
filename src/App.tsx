import React from "react";
import { Tabs } from "hero-design";
import { useTheme } from "styled-components";
import axios from "axios";

import logo from "./assets/logo_with_name.png";
import Configuration from "./Configuration";
import Sync from "./Sync";
import Storage, { JiraConfig } from "./Storage";
import JiraConfigContext from "./context/JiraConfigContext";

function App() {
  const [selectedTabId, setSelectedTabId] = React.useState<string | number>(1);
  const [config, setConfig] = React.useState<JiraConfig | undefined>(undefined);

  React.useEffect(() => {
    Storage.get().then((config) => {
      setConfig(config);
    });
  }, []);

  const theme = useTheme();

  React.useEffect(() => {
    if (config !== undefined) {
      axios.defaults.baseURL = config.host;
      axios.interceptors.request.use(
        (requestConfig) => {
          requestConfig.headers = {
            Authorization: `Basic ${Buffer.from(
              `${config.email}:${config.token}`
            ).toString("base64")}`,
          };
          return requestConfig;
        },
        (error) => Promise.reject(error)
      );
    }
  }, [config]);

  return (
    <div style={{ textAlign: "center", minWidth: 350 }}>
      <header>
        <img src={logo} alt="logo" style={{ height: 150 }} />
      </header>
      <div style={{ textAlign: "left" }}>
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
              disabled: config === undefined,
              panel:
                config === undefined ? (
                  <div />
                ) : (
                  <JiraConfigContext.Provider value={config}>
                    <Sync />
                  </JiraConfigContext.Provider>
                ),
              icon: "sync",
            },
            {
              id: 2,
              title: "Configuration",
              panel: <Configuration onSaveConfig={setConfig} />,
              icon: "adjustment",
            },
          ]}
          selectedTabId={config === undefined ? 2 : selectedTabId}
          onChange={(newTabId) => setSelectedTabId(newTabId)}
        />
      </div>
    </div>
  );
}

export default App;
