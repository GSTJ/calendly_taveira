import changelog from '../changelog.json';
import packageJson from '../package.json';

describe('release metadata', () => {
  it('documents the current package version', () => {
    expect(changelog[packageJson.version as keyof typeof changelog]).toMatch(
      /Calendly webhooks.*API requests/,
    );
  });
});
