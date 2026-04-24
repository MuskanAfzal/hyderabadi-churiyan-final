import * as fs from 'fs';
import * as path from 'path';

export class FileDB<T> {
  private filePath: string;

  constructor(
    relPath: string,
    private fallback: T,
  ) {
    this.filePath = path.join(
      /* turbopackIgnore: true */ process.cwd(),
      relPath,
    );
    this.ensure();
  }

  private ensure() {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(
        this.filePath,
        JSON.stringify(this.fallback, null, 2),
        'utf-8',
      );
    }
  }

  read(): T {
    this.ensure();
    const raw = fs
      .readFileSync(this.filePath, 'utf-8')
      .replace(/^\uFEFF/, '')
      .replace(/\u0000/g, '');

    if (!raw.trim()) {
      return this.fallback;
    }

    try {
      return JSON.parse(raw) as T;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`${this.filePath} contains invalid JSON: ${message}`);
    }
  }

  write(data: T) {
    this.ensure();
    const tmpPath = `${this.filePath}.${process.pid}.tmp`;
    fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tmpPath, this.filePath);
  }
}
