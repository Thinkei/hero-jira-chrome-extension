import { Empty, Button } from "hero-design";
import React from "react";
import Storage, { JiraConfig } from "../Storage";
import SyncWithClient from "./SyncWithClient";

export default ({ goToConfiguration }: { goToConfiguration: () => void }) => {
  const [config, setConfig] = React.useState<JiraConfig | undefined>(undefined);

  React.useEffect(() => {
    Storage.get().then((config) => {
      setConfig(config);
    });
  }, []);

  if (
    config !== undefined &&
    config.email !== undefined &&
    config.email !== "" &&
    config.host !== undefined &&
    config.host !== "" &&
    config.token !== undefined &&
    config.token !== ""
  ) {
    return (
      <SyncWithClient
        host={config.host}
        token={config.token}
        email={config.email}
      />
    );
  }

  return (
    <Empty
      text="Missing or not yet configured!"
      extra={
        <Button
          icon="add"
          intent="primary"
          text="Go to Configuration"
          onClick={goToConfiguration}
        />
      }
    />
  );
};
