export type Environment = 'local' | 'production';

export class Environments {
  static getCurrent = () => process.env['ORISIRISI_ENV'] as Environment;
}
