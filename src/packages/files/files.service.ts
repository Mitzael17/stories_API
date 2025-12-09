import { ForbiddenException, Injectable } from "@nestjs/common";
import { join } from "path";
import { accessSync, appendFileSync, unlinkSync } from "node:fs";
import { mkdirSync } from "fs";
import { fileExistsSync } from "tsconfig-paths/lib/filesystem";
import { hash } from "node:crypto";
import { STATIC_FOLDER_DIR, URL_FILES_PATH } from "../../common/configs/static.config";
import { FileErrorsEnum } from "./common/enum/file-errors.enum";

@Injectable()
export class FilesService {
  private readonly DB_FILES_SEPARATOR = ", ";

  saveFiles(files: Express.Multer.File[], FILE_LIMIT?: number) {
    try {
      accessSync(STATIC_FOLDER_DIR);
    } catch (e) {
      mkdirSync(STATIC_FOLDER_DIR, { recursive: true });
    }

    if (FILE_LIMIT !== undefined && files.length > FILE_LIMIT) {
      throw new ForbiddenException(FileErrorsEnum.FILE_LIMIT.replace("{#}", `${FILE_LIMIT}`));
    }

    const filePaths: string[] = [];

    for (const file of files) {
      const filename = this.getFilename(file.originalname);

      appendFileSync(join(STATIC_FOLDER_DIR, filename), file.buffer);

      filePaths.push(filename);
    }

    return filePaths;
  }

  deleteFiles(filenames: string[]) {
    filenames.forEach(filename => {
      try {
        unlinkSync(join(STATIC_FOLDER_DIR, filename));
      } catch (e) {
        console.log(`Error deleting file: ${filename}`, e.message);
      }
    });
  }

  getFilenamesString(filenames: string[]) {
    return filenames.join(this.DB_FILES_SEPARATOR);
  }

  parseFilenamesFromString(filenamesString: string) {
    return filenamesString.length > 0 ? filenamesString.split(this.DB_FILES_SEPARATOR) : [];
  }

  concatUrlWithFiles(files: string[]) {
    return files.map(file => `${URL_FILES_PATH}${file}`);
  }

  saveFilesAndGetString(files: Express.Multer.File[], FILE_LIMIT?: number) {
    if (files.length === 0) {
      return "";
    }

    const savedFiles = this.saveFiles(files, FILE_LIMIT);
    return this.getFilenamesString(savedFiles);
  }

  processFilesUpdate(currentFilesString: string, deleteFiles: string[], newFiles: Express.Multer.File[], FILES_LIMIT?: number) {
    const currentFiles = this.parseFilenamesFromString(currentFilesString);
    const filteredDeleteFiles = deleteFiles.filter(file => currentFiles.includes(file));

    if (FILES_LIMIT !== undefined && currentFiles.length + newFiles.length - filteredDeleteFiles.length > FILES_LIMIT) {
      throw new ForbiddenException(FileErrorsEnum.FILE_LIMIT.replace("{#}", `${FILES_LIMIT}`));
    }

    if (filteredDeleteFiles.length > 0) {
      this.deleteFiles(filteredDeleteFiles);
    }

    const newFilenames = newFiles.length > 0 ? this.saveFiles(newFiles, FILES_LIMIT) : [];
    const updatedFilesForDb = [...currentFiles.filter(file => !filteredDeleteFiles.includes(file)), ...newFilenames];

    return this.getFilenamesString(updatedFilesForDb);
  }

  protected getFilename(filename: string) {
    filename = filename.replaceAll(this.DB_FILES_SEPARATOR, "");

    if (fileExistsSync(join(STATIC_FOLDER_DIR, filename))) {
      return this.getFilename(`${hash("md5", `${Date.now()}${Math.random()}`)}_${filename}`);
    }

    return filename;
  }
}
