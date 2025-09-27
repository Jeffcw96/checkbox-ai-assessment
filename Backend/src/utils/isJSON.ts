export const isJSON = (stringifiedJSON: string) => {
  try {
    JSON.parse(stringifiedJSON);
    return true;
  } catch (_error: unknown) {
    return false;
  }
};
