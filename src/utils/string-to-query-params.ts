import { anyToArray, CustomObject } from "@akb2/types-tools";

export const stringToQueryParams = (queryString: string): CustomObject<string> => {
  if (!Boolean(queryString)) {
    return {};
  }

  const params = anyToArray(queryString.split('&'));
  const queryParams: CustomObject<string> = {};

  for (const param of params) {
    const [key, value] = param.split('=');
    if (key) {
      queryParams[key] = value ?? '';
    }
  }

  return queryParams;
};
