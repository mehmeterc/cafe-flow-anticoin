/**
 * Optimize dependency installation for lovable.dev
 */
function readPackage(pkg) {
  // Remove unnecessary optional dependencies that might cause timeout
  if (pkg.optionalDependencies) {
    if (process.env.NODE_ENV === 'production') {
      delete pkg.optionalDependencies;
    }
  }

  // Fix specific package issues that might cause build problems
  if (pkg.name === 'your-problematic-package') {
    pkg.dependencies = pkg.dependencies || {};
    pkg.dependencies['some-dep'] = '^1.0.0';
  }

  return pkg;
}

module.exports = {
  hooks: {
    readPackage
  }
};
