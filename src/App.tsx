import React from "react";
import { Tabs } from "hero-design";
import { useTheme } from "styled-components";

import logo from "./assets/logo_with_name.png";
import Configuration from "./Configuration";
import Sync from "./Sync";

function App() {
  const [selectedTabId, setSelectedTabId] = React.useState<string | number>(1);
  const theme = useTheme();
  return (
    <div style={{ textAlign: "center", minWidth: 350 }}>
      <header>
        <img src={logo} alt="logo" style={{ height: 150 }} />
      </header>

      <Tabs
        renderActiveTabPanelOnly
        id="config-tabs"
        style={{
          marginLeft: theme.space.small,
          marginRight: theme.space.small,
          marginBottom: theme.space.small,
        }}
        tabs={[
          {
            id: 1,
            title: "Sync",
            panel: <Sync goToConfiguration={() => setSelectedTabId(2)} />,
            icon: "sync",
          },
          {
            id: 2,
            title: "Configuration",
            panel: <Configuration />,
            icon: "adjustment",
          },
        ]}
        selectedTabId={selectedTabId}
        onChange={(newTabId) => setSelectedTabId(newTabId)}
      />
    </div>
  );
}

export default App;
