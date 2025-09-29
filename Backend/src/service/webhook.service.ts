export const handleContractEvent = async (eventOperation: any) => {
  switch (eventOperation) {
    case "create":
      console.log("create event operation reroute");
      break;
    case "update":
      console.log("update event operation reroute");
      break;
    case "delete":
      console.log("delete event operation reroute");
      break;
    case "status_updated":
      console.log("status_updated event operation reroute");
    case "comment_added":
      console.log("comment_added event operation reroute");
    default:
      console.log(`Unknown event operation: ${eventOperation}`);
  }
};

export const findEventDomain = async (eventType: string) => {
  const domain = eventType.split(".")[0];
  return domain;
};
