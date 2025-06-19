
export interface PipedreamApp {
  name: string;
  name_slug: string;
  auth_type: string;
  categories: string[];
  description: string;
  custom_fields_json?: any; // Making this optional since it's not always present
}
