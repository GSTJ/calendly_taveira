import changelog from '../changelog.json';
import packageJson from '../package.json';

describe('release metadata', () => {
  it('documents the current package version', () => {
    const currentEntry = changelog[
      packageJson.version as keyof typeof changelog
    ] as string | undefined;

    expect(currentEntry?.trim()).toBeTruthy();
  });
});
