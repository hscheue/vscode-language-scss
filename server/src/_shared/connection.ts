import {
  ProposedFeatures,
  createConnection,
  Range,
} from "vscode-languageserver/node";

export const connection = createConnection(ProposedFeatures.all);

export type FixMeCommand = {
  uri: string;
  range: Range;
  value: string;
};
