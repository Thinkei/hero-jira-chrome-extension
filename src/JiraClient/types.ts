export interface Person {
  accountId: string;
  avatarUrls: {
    "48x48": string;
  };
  displayName: string;
  emailAddress: string;
}

export interface Comment {
  author: Person;
  body: string;
  created: string;
  updated: string;
}

export interface Transition {
  id: string;
  name: string;
}

export interface Issue {
  id: string;
  key: string;
  fields: {
    assignee: null | Person;
    creator: Person;
    comment: {
      total: number;
      comments: Array<Comment>;
    };
    // Card title
    summary: string;
    // Card body
    description: string;
    status: Transition;
    issuetype: {
      name: string;
      iconUrl: string;
    };
  };
  renderedFields?: {
    description: string;
  };
}

export interface IssueCreationFields {
  projectId: string;
  issuetypeId?: string;
  summary: string;
  description: string;
  parentId?: string;
}

export interface IssueType {
  self: string;
  id: string;
  name: string;
  iconUrl: string;
  subtask: boolean;
}
export interface Project {
  self: string;
  id: string;
  key: string;
  name: string;
  avatarUrls: {
    "48x48": string;
  };
  issuetypes: IssueType[];
}
