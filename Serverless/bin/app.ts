import { App } from "aws-cdk-lib";
import { CheckBoxStack } from "../lib/checkbox-stack";

const app = new App();
new CheckBoxStack(app, "CheckboxCheckBoxStack", {
  env: {
    account: process.env.AWS_ACCOUNT_ID,
    region: process.env.AWS_REGION || "ap-southeast-1",
  },
});
