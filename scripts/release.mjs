#!/usr/bin/env zx

const version = process.env.npm_package_version;
if ( ! version ){
  console.error('No version specified in process.env.npm_package_vesion. This should be run via `npm run release`.');
  process.exit(1);
}

await $`git diff --exit-code`;
await $`git tag -a ${version} -m ${version}`;
await $`git push`;
await $`git push --tags`;
