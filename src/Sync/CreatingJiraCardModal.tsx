import { useGithubApi } from "../GithubApi";

import { Modal, Typography, Input, Select, Button, Spinner } from "hero-design";
import React from "react";
import styled, { useTheme } from "styled-components";
import useAxios from "axios-hooks";

import { IssueCreationFields, Project } from "../JiraClient/types";
import { PullResponse, Response } from "../Messaging/GithubMessage";
import { generatePullEndpoint } from "../GithubApi";

type SelectOptions = { text: string; value: string }[];
type IconUrls = Record<string, string>;

const initialFormState: IssueCreationFields = {
  projectId: "",
  summary: "",
  description: "",
  issuetypeId: "",
};

const FieldWrapper = styled.div`
  margin-bottom: ${({ theme }) => theme.space.small}px;
`;

const OptionWithIcon = ({ icon, text }: { icon: string; text: string }) => {
  const theme = useTheme();
  return (
    <div>
      <img
        src={icon}
        style={{
          height: 24,
          width: 24,
          marginRight: theme.space.small,
          verticalAlign: "middle",
          display: "inline-block",
        }}
      />
      {text}
    </div>
  );
};

const Body = ({
  formState,
  setFormState,
  projects,
  loading,
}: {
  formState: IssueCreationFields;
  setFormState: React.Dispatch<React.SetStateAction<IssueCreationFields>>;
  projects: Project[];
  loading: boolean;
}) => {
  const { projectId, summary, description, issuetypeId } = formState;

  const selectedProject: Project | null = React.useMemo(
    () => projects.find(({ id }) => id === projectId) ?? null,
    [projects, projectId]
  );

  const projectOptions: SelectOptions = React.useMemo(
    () =>
      projects.map(({ id, key, name }) => ({
        text: `[${key}] ${name}`,
        value: id,
      })),
    [projects]
  );

  const projectAvatars: IconUrls = React.useMemo(
    () =>
      projects.reduce(
        (acc, { id, avatarUrls }) => ({ ...acc, [id]: avatarUrls["48x48"] }),
        {}
      ),
    [projects]
  );

  const issueOptions: SelectOptions = React.useMemo(
    () =>
      selectedProject
        ? selectedProject.issuetypes.map(({ id, name }) => ({
            text: name,
            value: id,
          }))
        : [],
    [selectedProject]
  );

  const issueIcons: IconUrls = React.useMemo(
    () =>
      selectedProject
        ? selectedProject.issuetypes.reduce(
            (acc, { id, iconUrl }) => ({
              ...acc,
              [id]: iconUrl,
            }),
            {}
          )
        : {},
    [selectedProject]
  );

  const changeFormValue = React.useCallback(
    (field: Partial<IssueCreationFields>) =>
      setFormState((state) => ({ ...state, ...field })),
    [setFormState]
  );

  const [query, setQuery] = React.useState<string | undefined>("");

  return (
    <Spinner loading={loading}>
      <FieldWrapper>
        <Typography.Text tagName="label" fontWeight="semi-bold">
          Project
          <Select
            value={projectId}
            options={projectOptions}
            onChange={(value) =>
              changeFormValue({ projectId: value ? String(value) : undefined })
            }
            placeholder="Select a project"
            query={query}
            onQueryChange={setQuery}
            loading={loading}
            optionRenderer={({ option }) => (
              <OptionWithIcon
                icon={projectAvatars[option.value]}
                text={option.text}
              />
            )}
          />
        </Typography.Text>
      </FieldWrapper>
      <FieldWrapper>
        <Typography.Text tagName="label" fontWeight="semi-bold">
          Issue type
          <Select
            value={issuetypeId}
            onChange={(value) =>
              changeFormValue({ issuetypeId: value as string })
            }
            placeholder="Select an issue type"
            options={issueOptions}
            disabled={!projectId}
            optionRenderer={({ option }) => (
              <OptionWithIcon
                icon={issueIcons[option.value]}
                text={option.text}
              />
            )}
          />
        </Typography.Text>
      </FieldWrapper>
      <FieldWrapper>
        <Typography.Text tagName="label" fontWeight="semi-bold">
          Title
          <Input
            value={summary}
            onChange={(event) =>
              changeFormValue({ summary: event.target.value })
            }
            placeholder="Ticket summary"
            disabled={!projectId || !issuetypeId}
          />
        </Typography.Text>
      </FieldWrapper>
      <FieldWrapper>
        <Typography.Text tagName="label" fontWeight="semi-bold">
          Description
          <Input.TextArea
            value={description}
            onChange={(event) =>
              changeFormValue({ description: event.target.value })
            }
            placeholder="Ticket description"
            disabled={!projectId || !issuetypeId}
          />
        </Typography.Text>
      </FieldWrapper>
    </Spinner>
  );
};

const Footer = ({
  onClose,
  onSubmit,
  loading,
  formState,
}: {
  onClose: () => void;
  onSubmit: () => void;
  loading: boolean;
  formState: IssueCreationFields;
}) => {
  const { projectId, issuetypeId, summary } = formState;

  return (
    <div>
      <Button variant="text" text="Cancel" onClick={onClose} />
      <Button
        text="Create"
        onClick={onSubmit}
        loading={loading}
        disabled={!projectId || !issuetypeId || !summary}
      />
    </div>
  );
};

export default ({
  closeModal,
  githubIssue,
  setResponse,
}: {
  closeModal: () => void;
  githubIssue: PullResponse;
  setResponse: React.Dispatch<React.SetStateAction<Response | undefined>>;
}) => {
  const [formState, setFormState] =
    React.useState<IssueCreationFields>(initialFormState);

  const [{ data: createdIssue, loading: submitting }, submitIssue] = useAxios<{
    id: string;
    key: string;
  }>(
    {
      url: `/rest/api/2/issue`,
      method: "POST",
    },
    { manual: true }
  );

  const [{ data: projectsData, loading: loadingProjects }] = useAxios<{
    projects: Array<Project>;
  }>("rest/api/2/issue/createmeta");

  const { fetchData: fetchGithub, loading: updatingPR } = useGithubApi();

  React.useEffect(() => {
    if (createdIssue !== undefined) {
      fetchGithub({
        endpoint: generatePullEndpoint(githubIssue),
        method: "PATCH",
        body: { title: `[${createdIssue.key}] ${githubIssue.title}` },
      }).then(() => {
        setResponse({
          ...githubIssue,
          jiraKey: createdIssue.key,
        } as PullResponse);
        closeModal();
      });
    }
  }, [createdIssue]);

  const onSubmit = React.useCallback(() => {
    submitIssue({
      data: {
        fields: {
          summary: formState.summary,
          description: formState.description,
          project: { id: formState.projectId },
          issuetype: { id: formState.issuetypeId },
        },
      },
    });
  }, [formState]);

  return (
    <Modal
      open
      title="Create Jira card"
      body={
        <Body
          formState={formState}
          setFormState={setFormState}
          projects={projectsData?.projects || []}
          loading={loadingProjects}
        />
      }
      footer={
        <Footer
          loading={submitting || updatingPR}
          onClose={closeModal}
          onSubmit={onSubmit}
          formState={formState}
        />
      }
      variant="basic"
      size="small"
      onClose={closeModal}
    />
  );
};
