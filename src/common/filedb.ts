import fs from 'fs';
import path from 'path';

export class FileDB<T> {
  private filePath: string;
  private fallback: T;

  constructor(file: string, fallback: T) {
    this.fallback = fallback;

    const baseDir =
      process.env.NODE_ENV === 'production'
        ? '/tmp'
        : process.cwd();

    this.filePath = path.join(baseDir, file);
  }

  private ensure() {
    const dir = path.dirname(this.filePath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify(this.fallback, null, 2));
    }
  }

  read(): T {
    try {
      this.ensure();
      return JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
    } catch {
      return this.fallback;
    }
  }

  write(data: T) {
    try {
      this.ensure();
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
    } catch {
      // Prevent Vercel/serverless file-system crashes
      return;
    }
  }
}