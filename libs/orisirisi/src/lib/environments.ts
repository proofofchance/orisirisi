export type Environment = 'local' | 'prod';

export class Environments {
  static getCurrent = () => process.env['ORISIRISI_ENV'] as Environment;
}
