import { App } from "aws-cdk-lib";
import { CheckBoxStack } from "../lib/checkbox-stack";

const app = new App();
new CheckBoxStack(app, "CheckboxCheckBoxStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || "ap-southeast-1",
  },
});
