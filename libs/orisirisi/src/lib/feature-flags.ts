export class FeatureFlags {
  static showTestnets(): boolean {
    // return localStorage.getItem('SHOW_TEST_NETS') === 'true';
    return true;
  }
}
