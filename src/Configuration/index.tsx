import React from "react";
import { Input, Typography, Button, Icon } from "hero-design";
import Storage, { JiraConfig } from "../Storage";
import { useTheme } from "styled-components";

export default () => {
  const [host, setHost] = React.useState<string>("");
  const [token, setToken] = React.useState<string>("");
  const [email, setEmail] = React.useState<string>("");
  const [dirty, setDirty] = React.useState<boolean>(false);
  const [showedToken, setShowedToken] = React.useState<boolean>(false);
  const [showedSuccess, setShowedSuccess] = React.useState<boolean>(false);

  React.useEffect(() => {
    Storage.get().then((config) => {
      console.log({ config });
      setHost(config.host || "");
      setToken(config.token || "");
      setEmail(config.email || "");
    });
  }, []);

  React.useEffect(() => {
    let timerId: NodeJS.Timeout;
    if (showedSuccess === true) {
      timerId = setTimeout(() => setShowedSuccess(false), 2000);
    }
    return () => {
      clearTimeout(timerId);
    };
  }, [showedSuccess]);

  const saveToStorage = React.useCallback(
    ({ host, token, email }: JiraConfig) => {
      Storage.set(
        {
          host,
          token,
          email,
        },
        () => {
          setDirty(false);
          setShowedSuccess(true);
        }
      );
    },
    []
  );

  const theme = useTheme();

  const fieldSpacing = {
    marginBottom: theme.space.small,
    display: "block",
  };

  return (
    <div style={{ textAlign: "left" }}>
      <Typography.Text
        tagName="label"
        fontWeight="semi-bold"
        style={fieldSpacing}
      >
        Host
        <Input
          value={host}
          placeholder="Jira host..."
          onChange={(e) => {
            setHost(e.target.value);
            setDirty(true);
          }}
        />
      </Typography.Text>
      <Typography.Text
        tagName="label"
        fontWeight="semi-bold"
        style={fieldSpacing}
      >
        Jira token
        <Input
          value={token}
          placeholder="Jira secret token..."
          onChange={(e) => {
            setToken(e.target.value);
            setDirty(true);
          }}
          type={showedToken ? "text" : "password"}
          suffix={
            <Button.Icon
              icon={showedToken ? "eye-invisible-outlined" : "eye-outlined"}
              onClick={() => setShowedToken((v) => !v)}
            />
          }
        />
      </Typography.Text>
      <Typography.Text
        tagName="label"
        fontWeight="semi-bold"
        style={fieldSpacing}
      >
        Jira email
        <Input
          value={email}
          placeholder="Your Jira email..."
          onChange={(e) => {
            setEmail(e.target.value);
            setDirty(true);
          }}
        />
      </Typography.Text>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginTop: theme.space.medium,
        }}
      >
        <Button
          disabled={dirty === false}
          text="Save"
          onClick={() => saveToStorage({ host, token, email })}
          size="small"
        />
        {showedSuccess && (
          <Typography.Text
            fontSize={12}
            intent="success"
            style={{
              marginLeft: theme.space.xsmall,
              display: "flex",
              alignItems: "center",
            }}
          >
            <Icon
              icon="checkmark"
              style={{
                marginRight: theme.space.xxsmall,
              }}
            />
            Success!
          </Typography.Text>
        )}
      </div>
    </div>
  );
};
