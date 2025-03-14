# docs

## 9.27.0

### Minor Changes

- 03314e1: Switched from vm2 to isolated-vm for sandboxing the "Run Script" functionality in Flows

  ## Breaking change

  ### Removed Support for Custom NPM Modules in the "Run Script" Operation in Flows

  Previously, Directus used vm2 to execute code in Run Script operations within Flows. However, vm2 is now unmaintained
  and has critical security vulnerabilities that could allow sandbox escapes, potentially compromising the host machine.
  To ensure a secure execution environment, we have migrated to isolated-vm.

  If your script requires a third-party library, you will need to create a custom operation extension.

## 9.26.1

### Patch Changes

- b59e970: npm security updates
