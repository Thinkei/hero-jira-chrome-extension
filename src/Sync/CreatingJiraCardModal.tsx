import {
  Alert,
  Button,
  Input,
  Modal,
  Select,
  Spinner,
  Typography,
} from "hero-design";
import React from "react";
import styled, { useTheme } from "styled-components";
import useAxios from "axios-hooks";

import {
  IssueCreationFields,
  Project,
  IssueType,
  Issue,
} from "../JiraClient/types";
import { GithubIssueResponse } from "../Messaging/GithubMessage";
import { generatePullEndpoint, useGithubApi } from "../GithubApi";

type SelectOptions = React.ComponentProps<typeof Select>["options"];
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
  errors,
}: {
  formState: IssueCreationFields;
  setFormState: React.Dispatch<React.SetStateAction<IssueCreationFields>>;
  projects: Project[];
  loading: boolean;
  errors: string[];
}) => {
  const theme = useTheme();
  const { projectId, summary, description, issuetypeId, parentId } = formState;

  const selectedProject: Project | null = React.useMemo(
    () => projects.find(({ id }) => id === projectId) ?? null,
    [projects, projectId]
  );

  const selectedIssueType: IssueType | null = React.useMemo(
    () =>
      selectedProject &&
      (selectedProject.issuetypes.find(({ id }) => id === issuetypeId) ?? null),
    [selectedProject, issuetypeId]
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

  const issueTypeOptions: SelectOptions = React.useMemo(
    () =>
      selectedProject?.issuetypes.map(({ id, name }) => ({
        text: name,
        value: id,
      })) ?? [],
    [selectedProject]
  );

  const issueIcons: IconUrls = React.useMemo(
    () =>
      selectedProject?.issuetypes.reduce(
        (acc, { id, iconUrl }) => ({
          ...acc,
          [id]: iconUrl,
        }),
        {}
      ) ?? {},
    [selectedProject]
  );

  const changeFormValue = React.useCallback(
    (field: Partial<IssueCreationFields>) =>
      setFormState((state) => ({ ...state, ...field })),
    [setFormState]
  );

  const [projectQuery, setProjectQuery] = React.useState<string | undefined>(
    ""
  );
  const [parentTaskQuery, setParentTaskQuery] = React.useState<
    string | undefined
  >("");

  const [{ data: issueData, loading: loadingIssues }, fetchIssues] = useAxios<{
    issues: Array<Issue>;
  }>(
    {
      // @TODO: Paginate this api and async search
      url: `rest/api/2/search?jql=project=${
        selectedProject ? selectedProject.key : ""
      } AND issueType!=Subtask&fields=summary,issuetype&maxResults=1000`,
      method: "GET",
    },
    { manual: true }
  );

  const [parentIssues, setParentIssues] = React.useState<Issue[]>([]);

  const parentIssueOptions: SelectOptions = React.useMemo(
    () =>
      parentIssues.map(({ id, key, fields }) => ({
        text: `[${key}] ${fields.summary}`,
        value: id,
      })),
    [parentIssues]
  );

  const parentIssueIcons: IconUrls = React.useMemo(
    () =>
      parentIssues.reduce(
        (acc, { id, fields }) => ({
          ...acc,
          [id]: fields.issuetype.iconUrl,
        }),
        {}
      ) ?? {},
    [parentIssues]
  );

  React.useEffect(() => {
    if (issueData) setParentIssues(issueData.issues);
  }, [issueData]);

  React.useEffect(() => {
    if (projectId) setParentIssues([]);
  }, [projectId]);

  React.useEffect(() => {
    if (!selectedProject || !selectedIssueType) return;
    if (selectedIssueType.subtask) {
      fetchIssues();
    }
  }, [selectedIssueType, selectedProject]);

  return (
    <Spinner loading={loading}>
      {errors.length > 0 && (
        <Alert
          content={errors.join("\n")}
          variant="outlined"
          intent="error"
          style={{ marginBottom: theme.space.small }}
        />
      )}
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
            query={projectQuery}
            onQueryChange={setProjectQuery}
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
      {projectId && (
        <FieldWrapper>
          <Typography.Text tagName="label" fontWeight="semi-bold">
            Issue type
            <Select
              value={issuetypeId}
              onChange={(value) =>
                changeFormValue({ issuetypeId: String(value) })
              }
              placeholder="Select an issue type"
              options={issueTypeOptions}
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
      )}
      {selectedIssueType && selectedIssueType.subtask && (
        <FieldWrapper>
          <Typography.Text tagName="label" fontWeight="semi-bold">
            Parent issue
            <Select
              value={parentId}
              onChange={(value) =>
                changeFormValue({ parentId: value as string })
              }
              loading={loadingIssues}
              placeholder="Select a parent issue for subtask"
              query={parentTaskQuery}
              onQueryChange={setParentTaskQuery}
              options={parentIssueOptions}
              optionRenderer={({ option }) => (
                <OptionWithIcon
                  icon={parentIssueIcons[option.value]}
                  text={option.text}
                />
              )}
            />
          </Typography.Text>
        </FieldWrapper>
      )}
      {projectId && issuetypeId && (
        <>
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
        </>
      )}
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
  githubIssue: GithubIssueResponse;
  setResponse: (res: GithubIssueResponse) => void;
}) => {
  const [formState, setFormState] =
    React.useState<IssueCreationFields>(initialFormState);

  const [
    { data: createdIssue, loading: submitting, error: submitIssueError },
    submitIssue,
  ] = useAxios<
    {
      id: string;
      key: string;
    },
    { errors: { [key: string]: string } }
  >(
    {
      url: `/rest/api/2/issue`,
      method: "POST",
    },
    { manual: true }
  );

  const [errors, setErrors] = React.useState<string[]>([]);
  React.useEffect(() => {
    if (submitIssueError != null) {
      setErrors(Object.values(submitIssueError.response?.data.errors ?? {}));
    }
  }, [submitIssueError]);

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
        setResponse({ ...githubIssue, jiraKey: createdIssue.key });
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
          parent: formState.parentId && { id: formState.parentId },
        },
      },
    });
  }, [formState]);

  return (
    <Modal
      open
      title="Create Jira card"
      style={{ textAlign: "left" }}
      body={
        <Body
          formState={formState}
          setFormState={setFormState}
          projects={projectsData?.projects || []}
          loading={loadingProjects}
          errors={errors}
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
