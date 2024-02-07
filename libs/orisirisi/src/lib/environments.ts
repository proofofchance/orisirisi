export type NextEnvironment = 'local' | 'production';

export class NextEnvironments {
  static getCurrent = () =>
    process.env['NEXT_PUBLIC_ORISIRISI_ENV'] as NextEnvironment;
}
