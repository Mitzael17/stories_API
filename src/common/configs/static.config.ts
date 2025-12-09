import { join } from "path";

export const STATIC_FOLDER_DIR = join(process.cwd(), "static");
export const MAX_STORY_FILES = 5;

export const URL_FILES_PATH = process.env.FILES_URL || "http://localhost:3000/static/";
