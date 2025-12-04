import { ForbiddenException, Injectable } from "@nestjs/common";
import { join } from "path";
import { accessSync, appendFileSync, unlinkSync } from "node:fs";
import { mkdirSync } from "fs";
import { fileExistsSync } from "tsconfig-paths/lib/filesystem";
import { hash } from "node:crypto";
import { MAX_FILES, STATIC_FOLDER_DIR, URL_FILES_PATH } from "../../common/configs/static.config";
import { FileErrorsEnum } from "./common/enum/file-errors.enum";

@Injectable()
export class FilesService {
  saveFiles(files: Express.Multer.File[]) {
    try {
      accessSync(STATIC_FOLDER_DIR);
    } catch (e) {
      mkdirSync(STATIC_FOLDER_DIR, { recursive: true });
    }

    if (files.length > MAX_FILES) throw new ForbiddenException(FileErrorsEnum.MAX_FILES);

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
    return filenames.reduce((accumulator, currentValue) => `${accumulator}${currentValue}, `, "").replace(/,\s+$/, "");
  }

  concatUrlWithFiles(files: string[]) {
    return files.map(file => `${URL_FILES_PATH}${file}`);
  }

  protected getFilename(filename: string) {
    if (fileExistsSync(join(STATIC_FOLDER_DIR, filename))) {
      return this.getFilename(`${hash("md5", `${Date.now()}${Math.random()}`)}_${filename}`);
    }

    return filename;
  }
}
